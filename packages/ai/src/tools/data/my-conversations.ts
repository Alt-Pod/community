import { tool, zodSchema } from "ai";
import { z } from "zod";
import { conversationService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const myConversationsTool: CommunityToolDefinition = {
  meta: {
    id: "data.my_conversations",
    category: "data",
    displayName: "tools.data.myConversations.name",
    description: "List your conversations",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "List the current user's conversations. Returns conversation titles, associated agent, and creation date.",
      inputSchema: zodSchema(
        z.object({
          limit: z
            .number()
            .optional()
            .describe("Max number of conversations to return (default: 20)"),
        })
      ),
      execute: async ({ limit }) => {
        const conversations = await conversationService.getByUserId(ctx.userId);
        const capped = conversations.slice(0, limit ?? 20);
        return capped.map((c: Record<string, unknown>) => ({
          id: c.id,
          title: c.title,
          agent_id: c.agent_id,
          created_at: c.created_at,
        }));
      },
    }),
};
