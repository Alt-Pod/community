import type { Tool } from "ai";
import type { CommunityToolDefinition, ToolContext, ToolMeta } from "./types";

const toolRegistry = new Map<string, CommunityToolDefinition>();

export function registerTool(def: CommunityToolDefinition): void {
  toolRegistry.set(def.meta.id, def);
}

export function getToolById(id: string): CommunityToolDefinition | undefined {
  return toolRegistry.get(id);
}

export function getAllTools(): CommunityToolDefinition[] {
  return Array.from(toolRegistry.values());
}

export function getAllToolMetas(): ToolMeta[] {
  return getAllTools().map((t) => t.meta);
}

/** Tool IDs available to the default assistant (concierge mode) */
export const DEFAULT_ASSISTANT_TOOL_IDS = [
  "agents.list_agents",
  "agents.create_agent",
  "agents.update_agent",
  "agents.delete_agent",
  "google.web_search",
  "knowledge.save_entry",
  "knowledge.get_entries",
  "knowledge.delete_entry",
  "github.read_file",
  "github.list_directory",
  "github.search_code",
  "data.my_profile",
  "data.my_conversations",
  "data.my_messages",
  "data.list_agents",
  "data.list_tools",
  "data.get_agent_details",
  "data.my_jobs",
  "data.my_logs",
  "data.my_meetings",
  "planning.schedule_activity",
  "planning.schedule_meeting",
  "planning.list_scheduled_activities",
  "planning.cancel_scheduled_activity",
  "files.upload_file",
  "files.list_files",
  "files.get_file",
  "files.read_file",
  "files.update_file",
  "files.delete_file",
  "notifications.send_notification",
  "notifications.schedule_notification",
];

export function buildToolsForAgent(
  toolIds: string[],
  ctx?: ToolContext,
  options?: { serverOnly?: boolean }
): Record<string, Tool> {
  const universalIds = Array.from(toolRegistry.values())
    .filter((d) => d.meta.universal)
    .map((d) => d.meta.id);
  const allIds = [...new Set([...toolIds, ...universalIds])];

  const tools: Record<string, Tool> = {};
  for (const id of allIds) {
    const def = toolRegistry.get(id);
    if (!def) continue;
    let builtTool: Tool | undefined;
    if (def.toolFactory && ctx) {
      builtTool = def.toolFactory(ctx);
    } else if (def.tool) {
      builtTool = def.tool;
    }
    // In server-only mode, skip tools that have no execute (client-side tools)
    if (builtTool) {
      if (options?.serverOnly && !builtTool.execute) continue;
      tools[id] = builtTool;
    }
  }
  return tools;
}
