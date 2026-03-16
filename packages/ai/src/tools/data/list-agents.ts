import { tool, zodSchema } from "ai";
import { z } from "zod";
import { agentService, toolService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const listAgentsDataTool: CommunityToolDefinition = {
  meta: {
    id: "data.list_agents",
    category: "data",
    displayName: "tools.data.listAgents.name",
    description: "List all available agents",
    requiresConfirmation: false,
  },
  tool: tool({
    description:
      "List all active agents in the system with their names, descriptions, and assigned tool IDs. Does not expose internal system prompts.",
    inputSchema: zodSchema(z.object({})),
    execute: async () => {
      const agents = await agentService.getAll();
      const results = await Promise.all(
        agents.map(async (a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          status: a.status,
          tool_ids: await toolService.getToolsForAgent(a.id),
          created_at: a.created_at,
        }))
      );
      return results;
    },
  }),
};
