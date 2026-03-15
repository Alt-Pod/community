import { tool, zodSchema } from "ai";
import { z } from "zod";
import { sql } from "@community/backend";
import type { Agent } from "@community/shared";
import type { CommunityToolDefinition } from "../types";

export const deleteAgentTool: CommunityToolDefinition = {
  meta: {
    id: "agents.delete_agent",
    category: "agents",
    displayName: "tools.agents.deleteAgent.name",
    description: "Delete an agent from the organization",
    requiresConfirmation: true,
  },
  tool: tool({
    description: "Delete an agent from the organization",
    inputSchema: zodSchema(
      z.object({
        id: z.string().describe("The agent's UUID to delete"),
      })
    ),
    needsApproval: true,
    execute: async ({ id }) => {
      const [agent] = await sql<Agent[]>`
        DELETE FROM agents WHERE id = ${id} RETURNING id, name
      `;
      return agent
        ? { success: true, deleted: agent.name }
        : { error: "Agent not found" };
    },
  }),
};
