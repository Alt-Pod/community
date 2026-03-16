// Import domain modules to trigger registration
import "./agents";
import "./google";
import "./github";
import "./knowledge";
import "./prompt";
import "./data";
import "./planning";
import "./files";
import "./notifications";

// Re-export registry API
export {
  getToolById,
  getAllTools,
  getAllToolMetas,
  buildToolsForAgent,
  DEFAULT_ASSISTANT_TOOL_IDS,
} from "./registry";
export type { ToolMeta, ToolContext, CommunityToolDefinition } from "./types";
