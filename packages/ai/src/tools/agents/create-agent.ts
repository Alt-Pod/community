import { tool, zodSchema } from "ai";
import { z } from "zod";
import { sql, toolRepository } from "@community/backend";
import type { Agent } from "@community/shared";
import type { CommunityToolDefinition } from "../types";

export const createAgentTool: CommunityToolDefinition = {
  meta: {
    id: "agents.create_agent",
    category: "agents",
    displayName: "tools.agents.createAgent.name",
    description:
      "Create a new agent in the organization. Requires a name, description, and system prompt. Optionally assign tools by ID.",
    requiresConfirmation: true,
  },
  tool: tool({
    description:
      "Create a new agent in the organization. Requires a name, description, and system prompt. Optionally assign tools by their IDs (e.g. 'google.web_search', 'github.read_file'). Use data.list_tools to discover available tool IDs first.",
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
        tool_ids: z
          .array(z.string())
          .optional()
          .describe(
            "Optional list of tool IDs to assign to the agent (e.g. ['google.web_search', 'github.read_file'])"
          ),
      })
    ),
    needsApproval: true,
    execute: async ({ name, description, system_prompt, tool_ids }) => {
      const [agent] = await sql<Agent[]>`
        INSERT INTO agents (name, description, system_prompt)
        VALUES (${name}, ${description}, ${system_prompt})
        RETURNING id, name, description, status
      `;

      if (tool_ids && tool_ids.length > 0) {
        await toolRepository.assignToAgent(agent.id, tool_ids);
      }

      return { ...agent, tool_ids: tool_ids ?? [] };
    },
  }),
};
