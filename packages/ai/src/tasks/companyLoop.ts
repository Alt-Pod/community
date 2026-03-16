import { generateText } from "ai";
import { getModel } from "../model";
import {
  inngest,
  agentRepository,
  knowledgeService,
  scheduledActivityRepository,
  scheduledActivityService,
} from "@community/backend";
import { formatKnowledgeForContext } from "@community/backend";
import {
  INNGEST_FUNCTION_IDS,
  ACTIVITIES,
  MESSAGE_ROLES,
} from "@community/shared";
import type { Agent, ScheduledActivity } from "@community/shared";

interface PingDecision {
  action: "task" | "meeting" | "nothing";
  title?: string;
  goal?: string;
  agent_ids?: string[];
  reason?: string;
}

function formatRecentActivity(activities: ScheduledActivity[]): string {
  if (activities.length === 0) return "No recent activity.";

  return activities
    .map((a) => {
      const outcome = a.outcome
        ? ` → ${a.outcome.type}: ${a.outcome.summary}`
        : a.output
          ? ` → completed`
          : "";
      return `- [${a.activity_type}] "${a.title}" (${a.status})${outcome}`;
    })
    .join("\n");
}

function formatAgentList(agents: Agent[], currentAgentId: string): string {
  return agents
    .filter((a) => a.id !== currentAgentId)
    .map((a) => `- [id: ${a.id}] **${a.name}**: ${a.description || "No description"}`)
    .join("\n");
}

function formatRunningActivities(activities: ScheduledActivity[]): string {
  if (activities.length === 0) return "Nothing is currently running.";
  return activities
    .map((a) => `- [${a.activity_type}] "${a.title}" (running)`)
    .join("\n");
}

async function pingAgent(
  agent: Agent,
  context: {
    knowledgeContext: string;
    recentActivity: ScheduledActivity[];
    allAgents: Agent[];
    runningActivities: ScheduledActivity[];
  }
): Promise<PingDecision> {
  const prompt = `You are agent "${agent.name}" in a company of AI agents. You are being checked in on.

Here is your role:
${agent.system_prompt}

${context.knowledgeContext || "No prior knowledge available."}

Here are the other agents in the company:
${formatAgentList(context.allAgents, agent.id) || "No other agents."}

Your recent activity:
${formatRecentActivity(context.recentActivity)}

Currently running in the company:
${formatRunningActivities(context.runningActivities)}

Based on all this, decide what to do next:
- If you have a goal to pursue alone (research, investigation, file work, etc.) → respond with action: "task"
- If you need to collaborate with other agents to discuss or decide something → respond with action: "meeting" and specify which agent_ids to include (MUST be UUIDs from the list above, NOT names)
- If there's nothing to do right now → respond with action: "nothing"

IMPORTANT: Only choose "task" or "meeting" if there is a concrete, actionable goal. Do not create work for the sake of it.
IMPORTANT: agent_ids MUST be valid UUIDs (e.g. "5921b0db-b5a8-49cc-8331-d86b75d382a8"), never agent names.

Respond with ONLY valid JSON, no other text:
{ "action": "task" | "meeting" | "nothing", "title": "short title", "goal": "what you want to accomplish", "agent_ids": ["uuid1", "uuid2"], "reason": "why" }`;

  const { text } = await generateText({
    model: getModel(),
    messages: [{ role: MESSAGE_ROLES.USER, content: prompt }],
  });

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { action: "nothing" };

    const parsed = JSON.parse(jsonMatch[0]);
    // Validate agent_ids are actual UUIDs (not names)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validAgentIds = Array.isArray(parsed.agent_ids)
      ? parsed.agent_ids.filter((id: string) => uuidRegex.test(id))
      : [];
    return {
      action: parsed.action === "task" || parsed.action === "meeting" ? parsed.action : "nothing",
      title: parsed.title,
      goal: parsed.goal,
      agent_ids: validAgentIds,
      reason: parsed.reason,
    };
  } catch {
    console.log(`[company-loop] Failed to parse ping response for agent "${agent.name}":`, text);
    return { action: "nothing" };
  }
}

export const companyLoop = inngest.createFunction(
  { id: INNGEST_FUNCTION_IDS.COMPANY_LOOP },
  { cron: "*/15 * * * *" },
  async ({ step }) => {
    const userIds = await step.run("find-users-with-agents", async () => {
      return agentRepository.findDistinctUserIds();
    });

    if (userIds.length === 0) return { pinged: 0 };

    let totalPinged = 0;

    for (const userId of userIds) {
      const agents = await step.run(`load-agents-${userId}`, async () => {
        return agentRepository.findByUserId(userId);
      });

      for (const agent of agents) {
        const decision = await step.run(`ping-${userId}-${agent.id}`, async () => {
          // Skip if agent is already in a running activity
          const running = await scheduledActivityRepository.findRunningByAgent(agent.id);
          if (running.length > 0) {
            console.log(`[company-loop] Agent "${agent.name}" is busy, skipping`);
            return { action: "nothing" as const };
          }

          // Load context
          const knowledgeEntries = await knowledgeService.getEntries(userId);
          const knowledgeContext = formatKnowledgeForContext(knowledgeEntries);
          const recentActivity = await scheduledActivityRepository.findRecentByAgent(agent.id, 10);
          const allAgents = await agentRepository.findByUserId(userId);
          const runningActivities = await scheduledActivityRepository.findRunningByUser(userId);

          return pingAgent(agent, {
            knowledgeContext,
            recentActivity,
            allAgents,
            runningActivities,
          });
        });

        if (decision.action === ACTIVITIES.task.id && decision.goal) {
          await step.run(`schedule-task-${agent.id}`, async () => {
            console.log(`[company-loop] Agent "${agent.name}" wants a task: ${decision.title}`);
            await scheduledActivityService.schedule(userId, {
              agentId: agent.id,
              activityType: ACTIVITIES.task.id,
              title: decision.title || "Agent task",
              payload: {
                agent_id: agent.id,
                goal: decision.goal,
                max_iterations: 10,
              },
              scheduledAt: new Date().toISOString(),
            });
          });
        } else if (decision.action === ACTIVITIES.meeting.id && decision.goal && decision.agent_ids?.length) {
          await step.run(`schedule-meeting-${agent.id}`, async () => {
            console.log(`[company-loop] Agent "${agent.name}" wants a meeting: ${decision.title}`);
            await scheduledActivityService.schedule(userId, {
              agentId: agent.id,
              activityType: ACTIVITIES.meeting.id,
              title: decision.title || "Agent meeting",
              payload: {
                participant_agent_ids: decision.agent_ids,
                agenda: decision.goal,
                duration_minutes: 15,
                timezone: "UTC",
                include_assistant: false,
              },
              scheduledAt: new Date().toISOString(),
            });
          });
        }

        totalPinged++;
      }
    }

    return { pinged: totalPinged };
  }
);
