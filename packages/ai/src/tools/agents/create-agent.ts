import { tool, zodSchema } from "ai";
import { z } from "zod";
import { sql } from "@community/backend";
import type { Agent } from "@community/shared";
import type { CommunityToolDefinition } from "../types";

export const createAgentTool: CommunityToolDefinition = {
  meta: {
    id: "agents.create_agent",
    category: "agents",
    displayName: "tools.agents.createAgent.name",
    description:
      "Create a new agent in the organization. Requires a name, description, and system prompt.",
    requiresConfirmation: true,
  },
  tool: tool({
    description:
      "Create a new agent in the organization. Requires a name, description, and system prompt.",
    inputSchema: zodSchema(
      z.object({
        name: z.string().describe("The agent's display name"),
        description: z
          .string()
          .describe("A short description of what the agent does"),
        system_prompt: z
          .string()
          .describe(
            "The full system prompt that defines the agent's personality and behavior"
          ),
      })
    ),
    needsApproval: true,
    execute: async ({ name, description, system_prompt }) => {
      const [agent] = await sql<Agent[]>`
        INSERT INTO agents (name, description, system_prompt)
        VALUES (${name}, ${description}, ${system_prompt})
        RETURNING id, name, description, status
      `;
      return agent;
    },
  }),
};
