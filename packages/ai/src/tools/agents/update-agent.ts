import { tool, zodSchema } from "ai";
import { z } from "zod";
import { sql, toolRepository } from "@community/backend";
import type { Agent } from "@community/shared";
import type { CommunityToolDefinition } from "../types";

export const updateAgentTool: CommunityToolDefinition = {
  meta: {
    id: "agents.update_agent",
    category: "agents",
    displayName: "tools.agents.updateAgent.name",
    description:
      "Update an existing agent's name, description, system prompt, status, or assigned tools",
    requiresConfirmation: true,
  },
  tool: tool({
    description:
      "Update an existing agent's name, description, system prompt, status, or assigned tools. Use add_tool_ids/remove_tool_ids to modify tools incrementally without erasing existing ones. Use data.list_tools to discover available tool IDs.",
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
        add_tool_ids: z
          .array(z.string())
          .optional()
          .describe(
            "Tool IDs to add to the agent's existing tools (e.g. ['google.web_search']). Use data.list_tools to discover available IDs."
          ),
        remove_tool_ids: z
          .array(z.string())
          .optional()
          .describe(
            "Tool IDs to remove from the agent's current tools."
          ),
      })
    ),
    needsApproval: true,
    execute: async ({ id, add_tool_ids, remove_tool_ids, ...updates }) => {
      const values: Record<string, unknown> = {};
      if (updates.name !== undefined) values.name = updates.name;
      if (updates.description !== undefined)
        values.description = updates.description;
      if (updates.system_prompt !== undefined)
        values.system_prompt = updates.system_prompt;
      if (updates.status !== undefined) values.status = updates.status;

      const hasFieldUpdates = Object.keys(values).length > 0;
      const hasToolUpdates =
        (add_tool_ids && add_tool_ids.length > 0) ||
        (remove_tool_ids && remove_tool_ids.length > 0);

      if (!hasFieldUpdates && !hasToolUpdates) {
        return { error: "No fields to update" };
      }

      let agent: Agent | undefined;

      if (hasFieldUpdates) {
        const [updated] = await sql<Agent[]>`
          UPDATE agents
          SET ${sql(values)}, updated_at = now()
          WHERE id = ${id}
          RETURNING id, name, description, status
        `;
        agent = updated;
      } else {
        const [existing] = await sql<Agent[]>`
          SELECT id, name, description, status
          FROM agents
          WHERE id = ${id}
        `;
        agent = existing;
      }

      if (!agent) {
        return { error: "Agent not found" };
      }

      if (hasToolUpdates) {
        if (add_tool_ids && add_tool_ids.length > 0) {
          await toolRepository.assignToAgent(id, add_tool_ids);
        }
        if (remove_tool_ids && remove_tool_ids.length > 0) {
          await toolRepository.removeFromAgent(id, remove_tool_ids);
        }
      }

      const currentTools = await toolRepository.findByAgentId(id);
      return { ...agent, tool_ids: currentTools };
    },
  }),
};
