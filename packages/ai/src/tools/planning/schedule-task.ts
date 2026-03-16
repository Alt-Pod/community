import { tool, zodSchema } from "ai";
import { z } from "zod";
import { scheduledActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";
import { ACTIVITIES } from "@community/shared";
import type { TaskPayload } from "@community/shared";

export const scheduleTaskTool: CommunityToolDefinition = {
  meta: {
    id: "planning.schedule_task",
    category: "planning",
    displayName: "tools.planning.scheduleTask.name",
    description: "Schedule a solo agent task — one agent works independently with tools toward a goal. Starts immediately.",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Schedule a task for a single agent to work on independently. The agent will use its tools to achieve the specified goal. Tasks start as soon as possible. A summary with outcome is generated at the end.",
      inputSchema: zodSchema(
        z.object({
          title: z.string().describe("Short title for the task"),
          goal: z
            .string()
            .describe(
              "The goal the agent should accomplish. Be specific about what success looks like."
            ),
          agent_id: z
            .string()
            .describe("The ID of the agent that will perform the task"),
          max_iterations: z
            .number()
            .min(1)
            .max(20)
            .default(10)
            .describe(
              "Maximum number of iterations the agent can take (1-20, default 10)"
            ),
        })
      ),
      needsApproval: true,
      execute: async ({ title, goal, agent_id, max_iterations }) => {
        const taskPayload: TaskPayload = {
          agent_id,
          goal,
          max_iterations,
        };

        const activity = await scheduledActivityService.schedule(ctx.userId, {
          agentId: agent_id,
          activityType: ACTIVITIES.task.id,
          title,
          description: goal,
          scheduledAt: new Date().toISOString(),
          payload: taskPayload as unknown as Record<string, unknown>,
        });

        return {
          success: true,
          id: activity.id,
          activity_type: ACTIVITIES.task.id,
          scheduled_at: activity.scheduled_at,
          agent_id,
          max_iterations,
        };
      },
    }),
};
