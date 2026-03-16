import { tool, zodSchema } from "ai";
import { z } from "zod";
import { auditLogService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const myLogsTool: CommunityToolDefinition = {
  meta: {
    id: "data.my_logs",
    category: "data",
    displayName: "tools.data.myLogs.name",
    description: "Read the user's activity logs",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "List the current user's activity logs (audit trail). Shows events like conversations created, meetings scheduled/started/completed, agents created/updated/deleted, files uploaded/deleted, etc. Optionally filter by event type or entity type.",
      inputSchema: zodSchema(
        z.object({
          event_type: z
            .string()
            .optional()
            .describe(
              "Filter by event type (e.g. conversation.created, meeting.scheduled, agent.created, file.uploaded)"
            ),
          entity_type: z
            .string()
            .optional()
            .describe(
              "Filter by entity type (e.g. conversation, meeting, agent, file, knowledge_entry)"
            ),
          limit: z
            .number()
            .min(1)
            .max(50)
            .default(20)
            .describe("Maximum number of logs to return (default 20)"),
        })
      ),
      execute: async ({ event_type, entity_type, limit }) => {
        const logs = await auditLogService.getByUserId(ctx.userId, {
          eventType: event_type,
          entityType: entity_type,
          limit,
        });
        return logs;
      },
    }),
};
