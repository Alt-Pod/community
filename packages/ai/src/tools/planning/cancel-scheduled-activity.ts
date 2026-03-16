import { tool, zodSchema } from "ai";
import { z } from "zod";
import { scheduledActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const cancelScheduledActivityTool: CommunityToolDefinition = {
  meta: {
    id: "planning.cancel_scheduled_activity",
    category: "planning",
    displayName: "tools.planning.cancelScheduledActivity.name",
    description: "Cancel a scheduled activity",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description: "Cancel a scheduled activity by its ID. Only activities with status 'scheduled' can be cancelled.",
      inputSchema: zodSchema(
        z.object({
          activity_id: z
            .string()
            .describe("The ID of the scheduled activity to cancel"),
        })
      ),
      needsApproval: true,
      execute: async ({ activity_id }) => {
        await scheduledActivityService.cancel(activity_id, ctx.userId);
        return { success: true, cancelled: activity_id };
      },
    }),
};
