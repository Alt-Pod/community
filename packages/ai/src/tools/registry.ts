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

export function buildToolsForAgent(
  toolIds: string[],
  ctx?: ToolContext
): Record<string, Tool> {
  const universalIds = Array.from(toolRegistry.values())
    .filter((d) => d.meta.universal)
    .map((d) => d.meta.id);
  const allIds = [...new Set([...toolIds, ...universalIds])];

  const tools: Record<string, Tool> = {};
  for (const id of allIds) {
    const def = toolRegistry.get(id);
    if (!def) continue;
    if (def.toolFactory && ctx) {
      tools[id] = def.toolFactory(ctx);
    } else if (def.tool) {
      tools[id] = def.tool;
    }
  }
  return tools;
}
