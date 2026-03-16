import { tool, zodSchema } from "ai";
import { z } from "zod";
import { conversationService, chatService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const myMessagesTool: CommunityToolDefinition = {
  meta: {
    id: "data.my_messages",
    category: "data",
    displayName: "tools.data.myMessages.name",
    description: "Read messages from one of your conversations",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Read messages from a specific conversation. The user must own the conversation. Returns message role, content, and timestamp.",
      inputSchema: zodSchema(
        z.object({
          conversationId: z
            .string()
            .describe("The conversation ID to read messages from"),
          limit: z
            .number()
            .optional()
            .describe("Max number of messages to return (default: 50)"),
        })
      ),
      execute: async ({ conversationId, limit }) => {
        // Verify the user owns this conversation
        const conversation = await conversationService.findById(
          conversationId,
          ctx.userId
        );
        if (!conversation) {
          return { error: "Conversation not found or access denied" };
        }

        const messages = await chatService.getMessages(conversationId);
        const capped = messages.slice(0, limit ?? 50);
        return capped.map((m: Record<string, unknown>) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          agent_id: m.agent_id,
          created_at: m.created_at,
        }));
      },
    }),
};
