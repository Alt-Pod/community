import { registerTool } from "../registry";
import { saveKnowledgeEntryTool } from "./save-entry";
import { getKnowledgeEntriesTool } from "./get-entries";
import { deleteKnowledgeEntryTool } from "./delete-entry";

export const knowledgeToolDefinitions = [
  saveKnowledgeEntryTool,
  getKnowledgeEntriesTool,
  deleteKnowledgeEntryTool,
];

for (const def of knowledgeToolDefinitions) {
  registerTool(def);
}
