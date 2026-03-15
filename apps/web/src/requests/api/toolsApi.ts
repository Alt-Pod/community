import type { ToolDefinition } from "@community/shared";

export async function fetchToolDefinitions(): Promise<ToolDefinition[]> {
  const res = await fetch("/api/tools");
  if (!res.ok) throw new Error("Failed to fetch tool definitions");
  return res.json();
}

export async function fetchAgentTools(agentId: string): Promise<string[]> {
  const res = await fetch(`/api/agents/${agentId}/tools`);
  if (!res.ok) throw new Error("Failed to fetch agent tools");
  return res.json();
}

export async function setAgentTools(
  agentId: string,
  toolIds: string[]
): Promise<void> {
  const res = await fetch(`/api/agents/${agentId}/tools`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolIds }),
  });
  if (!res.ok) throw new Error("Failed to set agent tools");
}
