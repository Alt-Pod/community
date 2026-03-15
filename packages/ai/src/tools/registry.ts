import type { Tool } from "ai";
import type { CommunityToolDefinition, ToolMeta } from "./types";

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
  toolIds: string[]
): Record<string, Tool> {
  const tools: Record<string, Tool> = {};
  for (const id of toolIds) {
    const def = toolRegistry.get(id);
    if (def?.tool) {
      tools[id] = def.tool;
    }
  }
  return tools;
}
