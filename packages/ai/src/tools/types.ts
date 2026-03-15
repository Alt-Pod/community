import type { Tool } from "ai";

export interface ToolMeta {
  id: string;
  category: string;
  displayName: string;
  description: string;
  requiresConfirmation: boolean;
}

export interface CommunityToolDefinition {
  meta: ToolMeta;
  tool: Tool;
}
