import { registerTool } from "../registry";
import { listAgentsTool } from "./list-agents";
import { createAgentTool } from "./create-agent";
import { updateAgentTool } from "./update-agent";
import { deleteAgentTool } from "./delete-agent";
import { getAgentPromptTool } from "./get-agent-prompt";

export const agentToolDefinitions = [
  listAgentsTool,
  createAgentTool,
  updateAgentTool,
  deleteAgentTool,
  getAgentPromptTool,
];

for (const def of agentToolDefinitions) {
  registerTool(def);
}
