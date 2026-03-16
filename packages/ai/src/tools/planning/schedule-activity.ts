import { tool, zodSchema } from "ai";
import { z } from "zod";
import { ACTIVITIES } from "@community/shared";
import { scheduledActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

const activityTypes = Object.keys(ACTIVITIES) as [string, ...string[]];

export const scheduleActivityTool: CommunityToolDefinition = {
  meta: {
    id: "planning.schedule_activity",
    category: "planning",
    displayName: "tools.planning.scheduleActivity.name",
    description: "Schedule a future activity for an agent to execute at a specific time",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description: `Schedule an activity for a future date/time. Available activity types: ${activityTypes.join(", ")}. The activity will be executed automatically when the scheduled time arrives.`,
      inputSchema: zodSchema(
        z.object({
          activity_type: z
            .enum(activityTypes)
            .describe("The type of activity to schedule"),
          title: z.string().describe("Short title for the scheduled activity"),
          description: z
            .string()
            .optional()
            .describe("Detailed description of what should happen"),
          scheduled_at: z
            .string()
            .describe(
              "ISO 8601 datetime for when to execute (e.g. 2026-03-20T09:00:00Z)"
            ),
          payload: z
            .record(z.string(), z.unknown())
            .optional()
            .describe("Additional parameters for the activity"),
        })
      ),
      needsApproval: true,
      execute: async ({ activity_type, title, description, scheduled_at, payload }) => {
        const activity = await scheduledActivityService.schedule(ctx.userId, {
          agentId: ctx.agentId,
          activityType: activity_type,
          title,
          description,
          scheduledAt: scheduled_at,
          payload: payload ?? {},
        });
        return {
          success: true,
          id: activity.id,
          activity_type: activity.activity_type,
          scheduled_at: activity.scheduled_at,
        };
      },
    }),
};
