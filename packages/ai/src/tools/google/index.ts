import { registerTool } from "../registry";
import { webSearchTool } from "./web-search";

export const googleToolDefinitions = [webSearchTool];

for (const def of googleToolDefinitions) {
  registerTool(def);
}
