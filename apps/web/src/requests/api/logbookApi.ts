import type { LogbookEntry } from "@community/shared";

export async function fetchTodayLogbook(): Promise<LogbookEntry | null> {
  const res = await fetch("/api/logbook/today");
  if (!res.ok) throw new Error("Failed to fetch today's logbook");
  return res.json();
}

export async function fetchLogbookByDate(
  date: string
): Promise<LogbookEntry | null> {
  const res = await fetch(`/api/logbook/${date}`);
  if (!res.ok) throw new Error("Failed to fetch logbook entry");
  return res.json();
}

export async function fetchLogbookEntries(params?: {
  limit?: number;
  offset?: number;
}): Promise<LogbookEntry[]> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  const res = await fetch(`/api/logbook${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch logbook entries");
  return res.json();
}
