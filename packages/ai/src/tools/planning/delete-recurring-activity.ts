import { tool, zodSchema } from "ai";
import { z } from "zod";
import { recurringActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const deleteRecurringActivityTool: CommunityToolDefinition = {
  meta: {
    id: "planning.delete_recurring_activity",
    category: "planning",
    displayName: "tools.planning.deleteRecurringActivity.name",
    description: "Delete a recurring activity and optionally cancel future instances",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Delete a recurring activity. By default, all future scheduled instances are also cancelled. Set cancel_future_instances to false to keep already-created instances.",
      inputSchema: zodSchema(
        z.object({
          recurring_activity_id: z.string().describe("ID of the recurring activity to delete"),
          cancel_future_instances: z
            .boolean()
            .default(true)
            .describe("Whether to cancel all future scheduled instances (default: true)"),
        })
      ),
      needsApproval: true,
      execute: async ({ recurring_activity_id, cancel_future_instances }) => {
        await recurringActivityService.delete(
          recurring_activity_id,
          ctx.userId,
          cancel_future_instances
        );

        return {
          success: true,
          deleted: recurring_activity_id,
          future_instances_cancelled: cancel_future_instances,
        };
      },
    }),
};
