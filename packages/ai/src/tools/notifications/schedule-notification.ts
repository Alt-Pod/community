import { tool, zodSchema } from "ai";
import { z } from "zod";
import { scheduledActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";
import type { ScheduledNotificationPayload } from "@community/shared";

export const scheduleNotificationTool: CommunityToolDefinition = {
  meta: {
    id: "notifications.schedule_notification",
    category: "notifications",
    displayName: "tools.notifications.scheduleNotification.name",
    description: "Schedule a reminder notification for a future time",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Schedule a reminder notification to be delivered at a specific future time. Use this when the user asks to be reminded about something later, e.g. 'remind me at 3pm to review the PRs'.",
      inputSchema: zodSchema(
        z.object({
          title: z
            .string()
            .describe("Short reminder title (max ~80 chars)"),
          body: z.string().describe("Reminder details — what to remember"),
          scheduled_at: z
            .string()
            .describe(
              "ISO 8601 datetime for when the reminder fires (e.g. 2026-03-20T15:00:00+01:00)"
            ),
          link: z
            .string()
            .optional()
            .describe(
              "Optional URL path to navigate to when clicked (e.g. /meetings/abc123)"
            ),
        })
      ),
      needsApproval: true,
      execute: async ({ title, body, scheduled_at, link }) => {
        const payload: ScheduledNotificationPayload = {
          title,
          body,
          type: "scheduled",
          link: link ?? null,
        };

        const activity = await scheduledActivityService.schedule(ctx.userId, {
          activityType: "scheduled_notification",
          title: `Reminder: ${title}`,
          description: body,
          scheduledAt: scheduled_at,
          payload: payload as unknown as Record<string, unknown>,
        });

        return {
          success: true,
          id: activity.id,
          activity_type: "scheduled_notification",
          scheduled_at: activity.scheduled_at,
        };
      },
    }),
};
