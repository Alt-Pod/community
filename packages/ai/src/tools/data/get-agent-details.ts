import { tool, zodSchema } from "ai";
import { z } from "zod";
import { agentService, toolService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const getAgentDetailsTool: CommunityToolDefinition = {
  meta: {
    id: "data.get_agent_details",
    category: "data",
    displayName: "tools.data.getAgentDetails.name",
    description: "Get an agent's details including assigned tools",
    requiresConfirmation: false,
  },
  tool: tool({
    description:
      "Get detailed information about a specific agent, including its assigned tool IDs. Use this to see which tools an agent has before modifying it.",
    inputSchema: zodSchema(
      z.object({
        agent_id: z.string().describe("The ID of the agent to look up"),
      })
    ),
    execute: async ({ agent_id }) => {
      const agent = await agentService.findById(agent_id);
      if (!agent) {
        return { error: "Agent not found" };
      }

      const toolIds = await toolService.getToolsForAgent(agent_id);

      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        status: agent.status,
        created_at: agent.created_at,
        updated_at: agent.updated_at,
        tool_ids: toolIds,
      };
    },
  }),
};
