import { registerTool } from "../registry";
import { readFileTool } from "./read-file";
import { listDirectoryTool } from "./list-directory";
import { searchCodeTool } from "./search-code";

export const githubToolDefinitions = [
  readFileTool,
  listDirectoryTool,
  searchCodeTool,
];

for (const def of githubToolDefinitions) {
  registerTool(def);
}
