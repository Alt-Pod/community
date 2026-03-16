import { registerTool } from "../registry";
import { myProfileTool } from "./my-profile";
import { myConversationsTool } from "./my-conversations";
import { myMessagesTool } from "./my-messages";
import { listAgentsDataTool } from "./list-agents";
import { myJobsTool } from "./my-jobs";

export const dataToolDefinitions = [
  myProfileTool,
  myConversationsTool,
  myMessagesTool,
  listAgentsDataTool,
  myJobsTool,
];

for (const def of dataToolDefinitions) {
  registerTool(def);
}
