import { tool, zodSchema } from "ai";
import { z } from "zod";
import { sql } from "@community/backend";
import type { Agent } from "@community/shared";
import type { CommunityToolDefinition } from "../types";

export const updateAgentTool: CommunityToolDefinition = {
  meta: {
    id: "agents.update_agent",
    category: "agents",
    displayName: "tools.agents.updateAgent.name",
    description:
      "Update an existing agent's name, description, or system prompt",
    requiresConfirmation: true,
  },
  tool: tool({
    description:
      "Update an existing agent's name, description, or system prompt",
    inputSchema: zodSchema(
      z.object({
        id: z.string().describe("The agent's UUID"),
        name: z.string().optional().describe("New name for the agent"),
        description: z
          .string()
          .optional()
          .describe("New description for the agent"),
        system_prompt: z
          .string()
          .optional()
          .describe("New system prompt for the agent"),
        status: z
          .enum(["active", "inactive"])
          .optional()
          .describe("Set the agent's status"),
      })
    ),
    needsApproval: true,
    execute: async ({ id, ...updates }) => {
      const values: Record<string, unknown> = {};
      if (updates.name !== undefined) values.name = updates.name;
      if (updates.description !== undefined)
        values.description = updates.description;
      if (updates.system_prompt !== undefined)
        values.system_prompt = updates.system_prompt;
      if (updates.status !== undefined) values.status = updates.status;

      if (Object.keys(values).length === 0) {
        return { error: "No fields to update" };
      }

      const [agent] = await sql<Agent[]>`
        UPDATE agents
        SET ${sql(values)}, updated_at = now()
        WHERE id = ${id}
        RETURNING id, name, description, status
      `;
      return agent ?? { error: "Agent not found" };
    },
  }),
};
