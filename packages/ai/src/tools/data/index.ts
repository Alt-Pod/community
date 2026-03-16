import { registerTool } from "../registry";
import { myProfileTool } from "./my-profile";
import { myConversationsTool } from "./my-conversations";
import { myMessagesTool } from "./my-messages";
import { listAgentsDataTool } from "./list-agents";
import { listToolsTool } from "./list-tools";
import { getAgentDetailsTool } from "./get-agent-details";
import { myJobsTool } from "./my-jobs";

export const dataToolDefinitions = [
  myProfileTool,
  myConversationsTool,
  myMessagesTool,
  listAgentsDataTool,
  listToolsTool,
  getAgentDetailsTool,
  myJobsTool,
];

for (const def of dataToolDefinitions) {
  registerTool(def);
}
