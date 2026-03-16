import { tool, zodSchema } from "ai";
import { z } from "zod";
import { knowledgeService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const getKnowledgeEntriesTool: CommunityToolDefinition = {
  meta: {
    id: "knowledge.get_entries",
    category: "knowledge",
    displayName: "tools.knowledge.getEntries.name",
    description: "Retrieve stored knowledge entries",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Retrieve knowledge entries from the knowledge base. Returns all entries for the user by default. Optionally filter by category.",
      inputSchema: zodSchema(
        z.object({
          category: z
            .string()
            .optional()
            .describe("Optional category filter (e.g. user.preferences, research)"),
        })
      ),
      execute: async ({ category }) => {
        const entries = await knowledgeService.getEntries(ctx.userId, {
          category,
        });
        return entries.map((e) => ({
          id: e.id,
          category: e.category,
          content: e.content,
          agent_id: e.agent_id,
          created_at: e.created_at,
        }));
      },
    }),
};
