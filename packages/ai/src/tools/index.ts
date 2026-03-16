// Import domain modules to trigger registration
import "./agents";
import "./google";
import "./github";
import "./knowledge";
import "./prompt";
import "./data";

// Re-export registry API
export {
  getToolById,
  getAllTools,
  getAllToolMetas,
  buildToolsForAgent,
} from "./registry";
export type { ToolMeta, ToolContext, CommunityToolDefinition } from "./types";
