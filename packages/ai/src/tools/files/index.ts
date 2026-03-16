import { registerTool } from "../registry";
import { uploadFileTool } from "./upload-file";
import { listFilesTool } from "./list-files";
import { getFileTool } from "./get-file";
import { updateFileTool } from "./update-file";
import { deleteFileTool } from "./delete-file";

export const fileToolDefinitions = [
  uploadFileTool,
  listFilesTool,
  getFileTool,
  updateFileTool,
  deleteFileTool,
];

for (const def of fileToolDefinitions) {
  registerTool(def);
}
