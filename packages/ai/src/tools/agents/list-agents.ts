import { tool, zodSchema } from "ai";
import { z } from "zod";
import { sql } from "@community/backend";
import { AGENT_STATUSES } from "@community/shared";
import type { Agent, AgentStatus } from "@community/shared";
import type { CommunityToolDefinition } from "../types";

export const listAgentsTool: CommunityToolDefinition = {
  meta: {
    id: "agents.list_agents",
    category: "agents",
    displayName: "tools.agents.listAgents.name",
    description: "List all active agents in the organization",
    requiresConfirmation: false,
  },
  tool: tool({
    description: "List all active agents in the organization",
    inputSchema: zodSchema(
      z.object({
        status: z
          .enum(Object.values(AGENT_STATUSES) as [AgentStatus, ...AgentStatus[]])
          .optional()
          .describe("Filter by status. Defaults to active."),
      })
    ),
    execute: async ({ status }) => {
      const filterStatus = status ?? AGENT_STATUSES.ACTIVE;
      const agents = await sql<Agent[]>`
        SELECT id, name, description, system_prompt, status, created_at, updated_at
        FROM agents
        WHERE status = ${filterStatus}
        ORDER BY created_at ASC
      `;
      return agents.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        status: a.status,
      }));
    },
  }),
};
