import { tool, zodSchema } from "ai";
import { z } from "zod";
import { recurringActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const updateRecurringActivityTool: CommunityToolDefinition = {
  meta: {
    id: "planning.update_recurring_activity",
    category: "planning",
    displayName: "tools.planning.updateRecurringActivity.name",
    description: "Update a recurring activity's schedule or details",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Update a recurring activity's recurrence rule or details. If the schedule changes, future instances are automatically cancelled and re-created with the new rule.",
      inputSchema: zodSchema(
        z.object({
          recurring_activity_id: z.string().describe("ID of the recurring activity to update"),
          title: z.string().optional().describe("New title"),
          description: z.string().nullable().optional().describe("New description"),
          frequency: z
            .enum(["daily", "weekly", "monthly"])
            .optional()
            .describe("New frequency"),
          interval: z.number().int().min(1).optional().describe("New interval"),
          days_of_week: z
            .array(z.number().int().min(0).max(6))
            .nullable()
            .optional()
            .describe("New days of week (weekly)"),
          day_of_month: z
            .number()
            .int()
            .min(1)
            .max(31)
            .nullable()
            .optional()
            .describe("New day of month (monthly)"),
          time_of_day: z.string().optional().describe("New time in HH:MM format"),
          timezone: z.string().optional().describe("New timezone"),
          start_date: z.string().optional().describe("New start date YYYY-MM-DD"),
          end_after_occurrences: z.number().int().min(1).nullable().optional(),
          end_by_date: z.string().nullable().optional(),
          payload: z.record(z.string(), z.unknown()).optional(),
        })
      ),
      needsApproval: true,
      execute: async ({ recurring_activity_id, interval, ...rest }) => {
        const updated = await recurringActivityService.update(
          recurring_activity_id,
          ctx.userId,
          {
            ...rest,
            intervalValue: interval,
          }
        );

        return {
          success: true,
          id: updated.id,
          title: updated.title,
          frequency: updated.frequency,
          interval: updated.interval_value,
          time_of_day: updated.time_of_day,
          timezone: updated.timezone,
        };
      },
    }),
};
