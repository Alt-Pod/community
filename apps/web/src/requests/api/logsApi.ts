import type { AuditLog } from "@community/shared";

export async function fetchLogs(params?: {
  eventType?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> {
  const url = new URL("/api/logs", window.location.origin);
  if (params?.eventType) url.searchParams.set("event_type", params.eventType);
  if (params?.entityType) url.searchParams.set("entity_type", params.entityType);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.offset) url.searchParams.set("offset", String(params.offset));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}
