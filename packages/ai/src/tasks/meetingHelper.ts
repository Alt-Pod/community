import { generateText, stepCountIs } from "ai";
import type { Tool } from "ai";
import { getModel } from "../model";
import { MEETING_MASTER_PROMPT, MEETING_SUPERVISOR_PROMPT, SUMMARY_AGENT_PROMPT } from "./meetingAgents";
import { getToolById } from "../tools";
import type { Agent, DbMessage, ActivityOutcome, ActivityOutcomeType } from "@community/shared";
import { chatService } from "@community/backend";

// --- Types ---

export interface ToolAction {
  toolName: string;
  args: Record<string, unknown>;
  approved: boolean;
  reason: string;
  result?: unknown;
}

// --- History helpers ---

export async function loadMeetingHistory(
  conversationId: string,
  agents: Agent[]
): Promise<{ speaker: string; content: string }[]> {
  const messages = await chatService.getMessages(conversationId) as unknown as DbMessage[];
  const agentMap = new Map(agents.map((a) => [a.id, a.name]));

  return messages.map((msg) => {
    const parts = (msg.parts ?? []) as { type?: string; speakerType?: string }[];
    const isDefaultAssistant = parts.some(
      (p) => p.type === "speaker-tag" && p.speakerType === "default-assistant"
    );
    return {
      speaker: isDefaultAssistant
        ? "Assistant"
        : msg.agent_id
          ? agentMap.get(msg.agent_id) ?? "Unknown Agent"
          : "Meeting Master",
      content: msg.content,
    };
  });
}

function formatTranscript(history: { speaker: string; content: string }[]): string {
  return history.map((m) => `**${m.speaker}**: ${m.content}`).join("\n\n");
}

// --- Supervisor ---

export async function supervisorReview(
  toolName: string,
  toolArgs: Record<string, unknown>,
  agenda: string,
  history: { speaker: string; content: string }[]
): Promise<{ approved: boolean; reason: string }> {
  const transcript = formatTranscript(history.slice(-10)); // last 10 messages for context

  const { text } = await generateText({
    model: getModel(),
    system: MEETING_SUPERVISOR_PROMPT,
    messages: [
      {
        role: "user",
        content: `A meeting agent wants to execute the following tool:\n\nTool: ${toolName}\nArguments: ${JSON.stringify(toolArgs, null, 2)}\n\nMeeting agenda: ${agenda}\n\nRecent transcript:\n${transcript}\n\nShould this action be approved?`,
      },
    ],
  });

  try {
    const parsed = JSON.parse(text);
    return {
      approved: Boolean(parsed.approved),
      reason: String(parsed.reason || ""),
    };
  } catch {
    // If supervisor can't parse, reject by default for safety
    return { approved: false, reason: "Supervisor response could not be parsed" };
  }
}

/**
 * Wraps tools so that any tool with requiresConfirmation calls the supervisor
 * before executing. If the supervisor rejects, the tool returns a rejection
 * message instead of executing.
 */
export function wrapToolsWithSupervisor(
  tools: Record<string, Tool>,
  agenda: string,
  historyGetter: () => { speaker: string; content: string }[]
): Record<string, Tool> {
  const wrapped: Record<string, Tool> = {};

  for (const [id, tool] of Object.entries(tools)) {
    const def = getToolById(id);
    const needsSupervisor = def?.meta.requiresConfirmation ?? false;

    if (needsSupervisor && tool.execute) {
      const originalExecute = tool.execute;
      wrapped[id] = {
        ...tool,
        execute: async (args: any, options: any) => {
          const review = await supervisorReview(id, args as Record<string, unknown>, agenda, historyGetter());
          if (!review.approved) {
            return { rejected: true, reason: review.reason };
          }
          return originalExecute(args, options);
        },
      } as Tool;
    } else {
      wrapped[id] = tool;
    }
  }

  return wrapped;
}

// --- Meeting Master functions ---

export async function generateMasterOpening(
  agenda: string,
  participantNames: string[]
): Promise<string> {
  const { text } = await generateText({
    model: getModel(),
    system: MEETING_MASTER_PROMPT,
    messages: [
      {
        role: "user",
        content: `Open this meeting. The agenda is:\n\n${agenda}\n\nParticipants: ${participantNames.join(", ")}\n\nPlease introduce the meeting and set the stage for discussion.`,
      },
    ],
  });
  return text;
}

export async function generateMasterTransition(
  history: { speaker: string; content: string }[],
  roundNumber: number,
  agenda: string
): Promise<string> {
  const transcript = formatTranscript(history);

  const { text } = await generateText({
    model: getModel(),
    system: MEETING_MASTER_PROMPT,
    messages: [
      {
        role: "user",
        content: `Here is the meeting transcript so far (round ${roundNumber} just ended):\n\n${transcript}\n\nThe agenda is:\n${agenda}\n\nProvide a brief transition to the next round. Summarize what was covered and redirect to topics not yet discussed.`,
      },
    ],
  });
  return text;
}

export async function generateMasterClosing(
  history: { speaker: string; content: string }[]
): Promise<string> {
  const transcript = formatTranscript(history);

  const { text } = await generateText({
    model: getModel(),
    system: MEETING_MASTER_PROMPT,
    messages: [
      {
        role: "user",
        content: `The meeting is now ending. Here is the full transcript:\n\n${transcript}\n\nClose the meeting with brief takeaways and thanks.`,
      },
    ],
  });
  return text;
}

// --- Agent turn with tools ---

export async function generateAgentTurnWithTools(
  agent: Agent,
  history: { speaker: string; content: string }[],
  agenda: string,
  participantNames: string[],
  tools: Record<string, Tool>
): Promise<{ text: string; toolActions: ToolAction[] }> {
  const meetingContext = `You are participating in a meeting. The agenda is:\n\n${agenda}\n\nOther participants: ${participantNames.join(", ")}\n\nContribute meaningfully to the discussion based on the conversation so far. Be concise and on-topic. You have access to tools — use them if relevant to the discussion. IMPORTANT: You MUST always produce a spoken response with your contribution to the meeting. If you use tools, summarize what you found or did in your response.`;

  const transcript = formatTranscript(history);

  const toolActions: ToolAction[] = [];

  const hasTools = Object.keys(tools).length > 0;
  const result = await generateText({
    model: getModel(),
    system: `${agent.system_prompt}\n\n${meetingContext}`,
    messages: [
      {
        role: "user",
        content: `Here is the meeting transcript so far:\n\n${transcript}\n\nIt's your turn to speak. Respond to the discussion.`,
      },
    ],
    tools: hasTools ? tools : undefined,
    stopWhen: hasTools ? stepCountIs(5) : undefined,
  });

  const allToolCalls = result.steps.flatMap((s) => (s as any).toolCalls ?? []);
  console.log(`[meeting] Agent "${agent.name}" turn — steps: ${result.steps.length}, text length: ${result.text.length}, finishReason: ${result.finishReason}, tools called: [${allToolCalls.map((tc: any) => tc.toolName).join(", ")}], available tools: [${Object.keys(tools).join(", ")}]`);

  // Collect tool actions from steps
  for (const s of result.steps) {
    const stepAny = s as any;
    if (stepAny.toolCalls) {
      for (const tc of stepAny.toolCalls) {
        const toolResult = stepAny.toolResults?.find(
          (tr: any) => tr.toolCallId === tc.toolCallId
        );
        const resultValue = toolResult?.result;
        const rejected = resultValue && typeof resultValue === "object" && "rejected" in resultValue;
        toolActions.push({
          toolName: tc.toolName,
          args: tc.args as Record<string, unknown>,
          approved: !rejected,
          reason: rejected ? String(resultValue?.reason ?? "") : "auto-approved or read-only",
          result: resultValue,
        });
      }
    }
  }

  return { text: result.text, toolActions };
}

// --- Default assistant turn ---

export async function generateDefaultAssistantTurn(
  systemPrompt: string,
  history: { speaker: string; content: string }[],
  agenda: string,
  participantNames: string[],
  tools: Record<string, Tool>
): Promise<{ text: string; toolActions: ToolAction[] }> {
  const meetingContext = `You are the default Assistant participating in a meeting. The agenda is:\n\n${agenda}\n\nOther participants: ${participantNames.join(", ")}\n\nContribute meaningfully to the discussion based on the conversation so far. Be concise and on-topic. You have access to a wide range of tools — use them if relevant to the discussion. IMPORTANT: You MUST always produce a spoken response with your contribution to the meeting. If you use tools, summarize what you found or did in your response.`;

  const transcript = formatTranscript(history);

  const toolActions: ToolAction[] = [];

  const hasAssistantTools = Object.keys(tools).length > 0;
  const result = await generateText({
    model: getModel(),
    system: `${systemPrompt}\n\n${meetingContext}`,
    messages: [
      {
        role: "user",
        content: `Here is the meeting transcript so far:\n\n${transcript}\n\nIt's your turn to speak. Respond to the discussion.`,
      },
    ],
    tools: hasAssistantTools ? tools : undefined,
    stopWhen: hasAssistantTools ? stepCountIs(5) : undefined,
  });

  const allAssistantToolCalls = result.steps.flatMap((s) => (s as any).toolCalls ?? []);
  console.log(`[meeting] Default assistant turn — steps: ${result.steps.length}, text length: ${result.text.length}, finishReason: ${result.finishReason}, tools called: [${allAssistantToolCalls.map((tc: any) => tc.toolName).join(", ")}], available tools: [${Object.keys(tools).join(", ")}]`);

  for (const s of result.steps) {
    const stepAny = s as any;
    if (stepAny.toolCalls) {
      for (const tc of stepAny.toolCalls) {
        const toolResult = stepAny.toolResults?.find(
          (tr: any) => tr.toolCallId === tc.toolCallId
        );
        const resultValue = toolResult?.result;
        const rejected = resultValue && typeof resultValue === "object" && "rejected" in resultValue;
        toolActions.push({
          toolName: tc.toolName,
          args: tc.args as Record<string, unknown>,
          approved: !rejected,
          reason: rejected ? String(resultValue?.reason ?? "") : "auto-approved or read-only",
          result: resultValue,
        });
      }
    }
  }

  return { text: result.text, toolActions };
}

// --- Summary ---

export async function generateSummaryTitle(summary: string): Promise<string> {
  const { text } = await generateText({
    model: getModel(),
    system:
      "Generate a concise title (5-10 words) for the following meeting summary. Output only the title, no quotes or punctuation at the end.",
    messages: [{ role: "user", content: summary }],
  });
  return text.trim();
}

export async function generateSummary(
  history: { speaker: string; content: string }[],
  agenda: string,
  participantNames: string[],
  durationMinutes: number
): Promise<{ summary: string; outcome: ActivityOutcome }> {
  const transcript = formatTranscript(history);

  const { text } = await generateText({
    model: getModel(),
    system: SUMMARY_AGENT_PROMPT,
    messages: [
      {
        role: "user",
        content: `Summarize this meeting.\n\nAgenda: ${agenda}\nParticipants: ${participantNames.join(", ")}\nDuration: ${durationMinutes} minutes\n\nTranscript:\n\n${transcript}`,
      },
    ],
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]);
    const outcomeType: ActivityOutcomeType =
      parsed.outcome_type === "needs_user_input" || parsed.outcome_type === "needs_follow_up"
        ? parsed.outcome_type
        : "goal_reached";

    const outcome: ActivityOutcome = {
      type: outcomeType,
      summary: String(parsed.summary || "Meeting completed."),
      user_prompt: parsed.user_prompt ? String(parsed.user_prompt) : undefined,
      follow_up_hint: parsed.follow_up_hint ? String(parsed.follow_up_hint) : undefined,
    };

    return { summary: outcome.summary, outcome };
  } catch {
    console.log("[meeting] Failed to parse outcome summary, defaulting to goal_reached");
    return {
      summary: text,
      outcome: { type: "goal_reached", summary: text },
    };
  }
}
