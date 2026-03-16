import { tool, zodSchema } from "ai";
import { z } from "zod";
import { knowledgeService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const saveKnowledgeEntryTool: CommunityToolDefinition = {
  meta: {
    id: "knowledge.save_entry",
    category: "knowledge",
    displayName: "tools.knowledge.saveEntry.name",
    description: "Save a fact or piece of information to the knowledge base",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Save a fact or piece of information to the knowledge base. Use this when the user shares personal information, preferences, goals, habits, or when you want to store research findings or notes for future reference.",
      inputSchema: zodSchema(
        z.object({
          category: z
            .string()
            .describe(
              "Category label for the entry (e.g. user.preferences, user.personal, user.work, user.goals, research, notes)"
            ),
          content: z
            .string()
            .describe("The fact or information to store"),
        })
      ),
      needsApproval: true,
      execute: async ({ category, content }) => {
        const entry = await knowledgeService.saveEntry(ctx.userId, {
          agentId: ctx.agentId,
          category,
          content,
        });
        return { success: true, id: entry.id, category: entry.category };
      },
    }),
};
