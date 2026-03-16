import type { ScheduledActivity } from "@community/shared";

export async function fetchScheduledActivities(params: {
  from: string;
  to: string;
  agentId?: string;
}): Promise<ScheduledActivity[]> {
  const url = new URL("/api/scheduled-activities", window.location.origin);
  url.searchParams.set("from", params.from);
  url.searchParams.set("to", params.to);
  if (params.agentId) {
    url.searchParams.set("agent_id", params.agentId);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch scheduled activities");
  return res.json();
}

export async function cancelScheduledActivity(id: string): Promise<void> {
  const res = await fetch(`/api/scheduled-activities/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to cancel scheduled activity");
}
