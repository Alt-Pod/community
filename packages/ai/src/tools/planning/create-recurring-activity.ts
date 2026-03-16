import { tool, zodSchema } from "ai";
import { z } from "zod";
import { recurringActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const createRecurringActivityTool: CommunityToolDefinition = {
  meta: {
    id: "planning.create_recurring_activity",
    category: "planning",
    displayName: "tools.planning.createRecurringActivity.name",
    description: "Create a recurring activity that repeats on a schedule (daily, weekly, monthly)",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Create a recurring activity that repeats on a schedule. Use this when the user wants something to happen regularly (e.g., 'every Monday', 'daily at 9am', 'monthly'). A background job will automatically create individual scheduled instances up to 30 days in advance.",
      inputSchema: zodSchema(
        z.object({
          activity_type: z
            .enum(["meeting", "report_generation", "scheduled_notification"])
            .describe("Type of activity to recur"),
          title: z.string().describe("Title for the recurring activity"),
          description: z.string().optional().describe("Optional description"),
          frequency: z
            .enum(["daily", "weekly", "monthly"])
            .describe("How often the activity repeats"),
          interval: z
            .number()
            .int()
            .min(1)
            .default(1)
            .describe("Repeat every N periods (e.g., every 2 weeks)"),
          days_of_week: z
            .array(z.number().int().min(0).max(6))
            .optional()
            .describe("Days of week for weekly frequency (0=Sun, 1=Mon, ..., 6=Sat)"),
          day_of_month: z
            .number()
            .int()
            .min(1)
            .max(31)
            .optional()
            .describe("Day of month for monthly frequency (1-31, clamped to month end)"),
          time_of_day: z
            .string()
            .describe("Time of day in HH:MM format (e.g., '09:00', '14:30')"),
          timezone: z
            .string()
            .default("UTC")
            .describe("IANA timezone identifier (e.g., Europe/Paris, America/New_York)"),
          start_date: z
            .string()
            .describe("Start date in YYYY-MM-DD format"),
          end_after_occurrences: z
            .number()
            .int()
            .min(1)
            .optional()
            .describe("Stop after this many occurrences (omit for no limit)"),
          end_by_date: z
            .string()
            .optional()
            .describe("Stop after this date in YYYY-MM-DD format (omit for no limit)"),
          payload: z
            .record(z.string(), z.unknown())
            .optional()
            .describe("Activity-specific payload (e.g., meeting agenda, participant IDs)"),
        })
      ),
      needsApproval: true,
      execute: async ({
        activity_type,
        title,
        description,
        frequency,
        interval,
        days_of_week,
        day_of_month,
        time_of_day,
        timezone,
        start_date,
        end_after_occurrences,
        end_by_date,
        payload,
      }) => {
        const recurring = await recurringActivityService.create(ctx.userId, {
          activityType: activity_type,
          title,
          description,
          frequency,
          intervalValue: interval,
          daysOfWeek: days_of_week,
          dayOfMonth: day_of_month,
          timeOfDay: time_of_day,
          timezone,
          startDate: start_date,
          endAfterOccurrences: end_after_occurrences,
          endByDate: end_by_date,
          payload: payload as Record<string, unknown>,
        });

        return {
          success: true,
          id: recurring.id,
          activity_type: recurring.activity_type,
          frequency: recurring.frequency,
          interval: recurring.interval_value,
          start_date: recurring.start_date,
          time_of_day: recurring.time_of_day,
          timezone: recurring.timezone,
        };
      },
    }),
};
