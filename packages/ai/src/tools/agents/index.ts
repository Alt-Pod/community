import { registerTool } from "../registry";
import { listAgentsTool } from "./list-agents";
import { createAgentTool } from "./create-agent";
import { updateAgentTool } from "./update-agent";
import { deleteAgentTool } from "./delete-agent";

export const agentToolDefinitions = [
  listAgentsTool,
  createAgentTool,
  updateAgentTool,
  deleteAgentTool,
];

for (const def of agentToolDefinitions) {
  registerTool(def);
}
