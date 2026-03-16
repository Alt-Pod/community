import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { CommunityToolDefinition } from "../types";
import { getAllToolMetas } from "../registry";

export const listToolsTool: CommunityToolDefinition = {
  meta: {
    id: "data.list_tools",
    category: "data",
    displayName: "tools.data.listTools.name",
    description: "List all available tools and their IDs",
    requiresConfirmation: false,
  },
  tool: tool({
    description:
      "List all available tools in the system with their IDs, categories, and descriptions. Useful for discovering tool IDs when creating or updating agents.",
    inputSchema: zodSchema(z.object({})),
    execute: async () => {
      const metas = getAllToolMetas();
      return metas
        .filter((m) => !m.universal)
        .map((m) => ({
          id: m.id,
          category: m.category,
          description: m.description,
        }));
    },
  }),
};
