import { tool, zodSchema } from "ai";
import { z } from "zod";
import { scheduledActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const listScheduledActivitiesTool: CommunityToolDefinition = {
  meta: {
    id: "planning.list_scheduled_activities",
    category: "planning",
    displayName: "tools.planning.listScheduledActivities.name",
    description: "List the user's scheduled activities",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "List the user's scheduled activities. Can filter by status or date range.",
      inputSchema: zodSchema(
        z.object({
          status: z
            .enum(["scheduled", "running", "completed", "failed", "cancelled"])
            .optional()
            .describe("Filter by status"),
          from: z
            .string()
            .optional()
            .describe("Start date (ISO 8601) for date range filter"),
          to: z
            .string()
            .optional()
            .describe("End date (ISO 8601) for date range filter"),
        })
      ),
      execute: async ({ status, from, to }) => {
        if (from && to) {
          return scheduledActivityService.getByDateRange(ctx.userId, from, to);
        }
        return scheduledActivityService.getByUserId(ctx.userId, { status });
      },
    }),
};
