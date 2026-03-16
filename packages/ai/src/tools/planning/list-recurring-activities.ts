import { tool, zodSchema } from "ai";
import { z } from "zod";
import { recurringActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const listRecurringActivitiesTool: CommunityToolDefinition = {
  meta: {
    id: "planning.list_recurring_activities",
    category: "planning",
    displayName: "tools.planning.listRecurringActivities.name",
    description: "List the user's recurring activities",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "List the user's recurring activities. Optionally filter by status (active, paused, deleted) or activity type.",
      inputSchema: zodSchema(
        z.object({
          status: z
            .enum(["active", "paused", "deleted"])
            .optional()
            .describe("Filter by status (default: all)"),
          activity_type: z
            .string()
            .optional()
            .describe("Filter by activity type (e.g., meeting, report_generation)"),
        })
      ),
      execute: async ({ status, activity_type }) => {
        const activities = await recurringActivityService.getByUserId(ctx.userId, {
          status,
          activityType: activity_type,
        });

        return activities.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          activity_type: a.activity_type,
          frequency: a.frequency,
          interval: a.interval_value,
          days_of_week: a.days_of_week,
          day_of_month: a.day_of_month,
          time_of_day: a.time_of_day,
          timezone: a.timezone,
          start_date: a.start_date,
          end_after_occurrences: a.end_after_occurrences,
          end_by_date: a.end_by_date,
          status: a.status,
          occurrences_created: a.occurrences_created,
        }));
      },
    }),
};
