import { tool, zodSchema } from "ai";
import { z } from "zod";
import { sql } from "@community/backend";
import type { Agent } from "@community/shared";
import type { CommunityToolDefinition } from "../types";

export const getAgentPromptTool: CommunityToolDefinition = {
  meta: {
    id: "agents.get_agent_prompt",
    category: "agents",
    displayName: "tools.agents.getAgentPrompt.name",
    description: "Get an agent's system prompt",
    requiresConfirmation: false,
  },
  tool: tool({
    description:
      "Get the full system prompt (instructions) of a specific agent. Use this when the user wants to see, review, or copy an agent's prompt.",
    inputSchema: zodSchema(
      z.object({
        agent_id: z.string().describe("The ID of the agent"),
      })
    ),
    execute: async ({ agent_id }) => {
      const [agent] = await sql<Pick<Agent, "id" | "name" | "system_prompt">[]>`
        SELECT id, name, system_prompt
        FROM agents
        WHERE id = ${agent_id}
      `;

      if (!agent) {
        return { error: "Agent not found" };
      }

      return {
        id: agent.id,
        name: agent.name,
        system_prompt: agent.system_prompt,
      };
    },
  }),
};
