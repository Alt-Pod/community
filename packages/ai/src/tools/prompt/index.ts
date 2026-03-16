import { registerTool } from "../registry";
import { promptSelectTool } from "./select";
import { promptMultiSelectTool } from "./multi-select";
import { promptTextInputTool } from "./text-input";
import { promptConfirmTool } from "./confirm";
import { promptFormTool } from "./form";

const promptTools = [
  promptSelectTool,
  promptMultiSelectTool,
  promptTextInputTool,
  promptConfirmTool,
  promptFormTool,
];

for (const def of promptTools) {
  registerTool(def);
}
