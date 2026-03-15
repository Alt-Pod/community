// Import domain modules to trigger registration
import "./agents";

// Re-export registry API
export {
  getToolById,
  getAllTools,
  getAllToolMetas,
  buildToolsForAgent,
} from "./registry";
export type { ToolMeta, CommunityToolDefinition } from "./types";
