import { generateText, stepCountIs } from "ai";
import {
  inngest,
  agentRepository,
  messageRepository,
  conversationService,
  scheduledActivityRepository,
  jobService,
  knowledgeService,
  toolService,
  notificationService,
  auditLogService,
  withJobTracking,
  formatKnowledgeForContext,
} from "@community/backend";
import { buildToolsForAgent } from "../tools";
import { getModel } from "../model";
import { TASK_AGENT_CONTEXT, OUTCOME_SUMMARY_PROMPT } from "./taskAgents";
import { wrapToolsWithSupervisor } from "./meetingHelper";
import {
  INNGEST_FUNCTION_IDS,
  INNGEST_EVENTS,
  ACTIVITY_STATUSES,
  MESSAGE_ROLES,
  ACTIVITY_OUTCOME_TYPES,
  NOTIFICATION_TYPE,
} from "@community/shared";
import type { TaskPayload, ActivityOutcome, ActivityOutcomeType } from "@community/shared";

async function loadTaskHistory(
  conversationId: string
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const messages = await messageRepository.findByConversationId(conversationId);
  return messages.map((m) => ({
    role: String(m.role) as typeof MESSAGE_ROLES.USER | typeof MESSAGE_ROLES.ASSISTANT,
    content: String(m.content),
  }));
}

async function generateOutcomeSummary(
  history: { role: string; content: string }[],
  goal: string,
  agentName: string
): Promise<{ summary: string; outcome: ActivityOutcome }> {
  const transcript = history
    .map((m) => `**${m.role === MESSAGE_ROLES.ASSISTANT ? agentName : "System"}**: ${m.content}`)
    .join("\n\n");

  const { text } = await generateText({
    model: getModel(),
    system: OUTCOME_SUMMARY_PROMPT,
    messages: [
      {
        role: MESSAGE_ROLES.USER,
        content: `Goal: ${goal}\nAgent: ${agentName}\n\nTranscript:\n\n${transcript}`,
      },
    ],
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]);
    const outcomeType: ActivityOutcomeType =
      parsed.outcome_type === ACTIVITY_OUTCOME_TYPES.NEEDS_USER_INPUT || parsed.outcome_type === ACTIVITY_OUTCOME_TYPES.NEEDS_FOLLOW_UP
        ? parsed.outcome_type
        : ACTIVITY_OUTCOME_TYPES.GOAL_REACHED;

    const outcome: ActivityOutcome = {
      type: outcomeType,
      summary: String(parsed.summary || "Task completed."),
      user_prompt: parsed.user_prompt ? String(parsed.user_prompt) : undefined,
      follow_up_hint: parsed.follow_up_hint ? String(parsed.follow_up_hint) : undefined,
    };

    return { summary: outcome.summary, outcome };
  } catch {
    console.log("[task] Failed to parse outcome summary, defaulting to goal_reached");
    return {
      summary: "Task completed.",
      outcome: { type: ACTIVITY_OUTCOME_TYPES.GOAL_REACHED, summary: "Task completed." },
    };
  }
}

export const taskExecution = inngest.createFunction(
  { id: INNGEST_FUNCTION_IDS.TASK_EXECUTION, retries: 1 },
  { event: INNGEST_EVENTS.TASK_READY },
  async ({ event, step }) => {
    const { activityId, jobId, userId } = event.data;

    const result = await step.run("execute-task", async () => {
      return withJobTracking(
        { jobService, activityRepository: scheduledActivityRepository },
        jobId,
        activityId,
        async () => {
          // Load activity
          const activity = await scheduledActivityRepository.findById(activityId);
          if (!activity || activity.status !== ACTIVITY_STATUSES.SCHEDULED) {
            return { skipped: true, reason: "not_scheduled" };
          }

          // Mark running
          await scheduledActivityRepository.updateStatus(activityId, ACTIVITY_STATUSES.RUNNING);

          const payload = activity.payload as unknown as TaskPayload;
          const agent = await agentRepository.findById(payload.agent_id);
          if (!agent) throw new Error(`Agent ${payload.agent_id} not found`);

          // Create task conversation
          const conversation = await conversationService.createTaskConversation(
            userId,
            `Task: ${payload.goal.slice(0, 80)}`
          );
          const conversationId = (conversation as { id: string }).id;

          // Update activity with conversation_id
          await scheduledActivityRepository.updatePayload(activityId, {
            ...payload,
            conversation_id: conversationId,
          });

          // Load knowledge context
          const knowledgeEntries = await knowledgeService.getEntries(userId);
          const knowledgeContext = formatKnowledgeForContext(knowledgeEntries);

          // Build agent's tools (server-only)
          const toolIds = await toolService.getToolsForAgent(agent.id);
          const rawTools = buildToolsForAgent(toolIds, { userId, agentId: agent.id }, { serverOnly: true });
          const tools = wrapToolsWithSupervisor(rawTools, payload.goal, () => []);

          const maxIterations = payload.max_iterations || 10;

          // Task loop
          for (let i = 0; i < maxIterations; i++) {
            const history = await loadTaskHistory(conversationId);

            const systemPrompt = `${agent.system_prompt}\n\n${TASK_AGENT_CONTEXT}\n\nGoal: ${payload.goal}\n\n${knowledgeContext}`;

            const iterationPrompt = i === 0
              ? `Begin working on the goal: ${payload.goal}`
              : `Continue working toward the goal. Review what you've done so far and take the next step. If you've achieved the goal or are blocked, say so clearly.`;

            const hasTools = Object.keys(tools).length > 0;
            const result = await generateText({
              model: getModel(),
              system: systemPrompt,
              messages: [
                ...history.map((m) => ({
                  role: m.role as typeof MESSAGE_ROLES.USER | typeof MESSAGE_ROLES.ASSISTANT,
                  content: m.content,
                })),
                { role: MESSAGE_ROLES.USER, content: iterationPrompt },
              ],
              tools: hasTools ? tools : undefined,
              stopWhen: hasTools ? stepCountIs(5) : undefined,
            });

            console.log(`[task] Agent "${agent.name}" iteration ${i + 1} — text length: ${result.text.length}, steps: ${result.steps.length}`);

            // Save iteration result as assistant message
            await messageRepository.create({
              conversationId,
              role: MESSAGE_ROLES.ASSISTANT,
              content: result.text,
              agentId: agent.id,
            });

            // Save the user prompt as well for history continuity
            await messageRepository.create({
              conversationId,
              role: MESSAGE_ROLES.USER,
              content: iterationPrompt,
              agentId: null,
            });
          }

          // Generate outcome-aware summary
          const finalHistory = await loadTaskHistory(conversationId);
          const { summary, outcome } = await generateOutcomeSummary(
            finalHistory,
            payload.goal,
            agent.name
          );

          // Generate title
          const summaryTitle = summary.slice(0, 80);

          // Save summary as final message
          await messageRepository.create({
            conversationId,
            role: MESSAGE_ROLES.ASSISTANT,
            content: `---\n\n## Task Summary\n\n${summary}`,
            agentId: null,
          });

          // Save to knowledge base
          await knowledgeService.saveEntry(userId, {
            category: "task_summary",
            content: summary,
            source: `task:${activityId}`,
            agentId: agent.id,
          });

          // Mark complete
          await conversationService.updateEndedAt(conversationId, new Date());
          await scheduledActivityRepository.markCompleted(
            activityId,
            {
              conversation_id: conversationId,
              summary,
              summary_title: summaryTitle,
              agent_name: agent.name,
            },
            outcome
          );
          await jobService.markCompleted(jobId, {
            activityId,
            conversation_id: conversationId,
            executed: true,
          });

          // Notify user based on outcome
          const notificationBody =
            outcome.type === ACTIVITY_OUTCOME_TYPES.NEEDS_USER_INPUT
              ? `${agent.name} needs your input: ${outcome.user_prompt || summary}`
              : outcome.type === ACTIVITY_OUTCOME_TYPES.NEEDS_FOLLOW_UP
                ? `${agent.name} completed a task but more work is needed: ${outcome.follow_up_hint || summary}`
                : `${agent.name} completed a task: ${summaryTitle}`;

          await notificationService.create(userId, {
            title: `Task ${outcome.type === ACTIVITY_OUTCOME_TYPES.GOAL_REACHED ? "completed" : outcome.type === ACTIVITY_OUTCOME_TYPES.NEEDS_USER_INPUT ? "needs input" : "needs follow-up"}: ${payload.goal.slice(0, 50)}`,
            body: notificationBody,
            type: outcome.type === ACTIVITY_OUTCOME_TYPES.NEEDS_USER_INPUT ? NOTIFICATION_TYPE.WARNING : NOTIFICATION_TYPE.AGENT,
            link: `/tasks/${activityId}`,
            metadata: { activityId, agentName: agent.name, outcomeType: outcome.type },
          }).catch(() => {});

          // Audit log
          await auditLogService.log(
            userId,
            "task.completed",
            "task",
            activityId,
            { title: payload.goal.slice(0, 80), agentName: agent.name, outcomeType: outcome.type }
          ).catch(() => {});

          return { summary, outcome };
        }
      );
    });

    return result;
  }
);
