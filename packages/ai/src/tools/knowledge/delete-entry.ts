import { tool, zodSchema } from "ai";
import { z } from "zod";
import { knowledgeService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const deleteKnowledgeEntryTool: CommunityToolDefinition = {
  meta: {
    id: "knowledge.delete_entry",
    category: "knowledge",
    displayName: "tools.knowledge.deleteEntry.name",
    description: "Delete a knowledge entry",
    requiresConfirmation: true,
    universal: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Delete a knowledge entry by ID. Use when the user asks to remove or forget stored information.",
      inputSchema: zodSchema(
        z.object({
          id: z.string().describe("The ID of the knowledge entry to delete"),
        })
      ),
      needsApproval: true,
      execute: async ({ id }) => {
        const deleted = await knowledgeService.deleteEntry(id, ctx.userId);
        return { success: deleted };
      },
    }),
};
