import type { RecurringActivity, RecurringActivityStatus } from "@community/shared";

export async function fetchRecurringActivities(
  status?: RecurringActivityStatus
): Promise<RecurringActivity[]> {
  const url = new URL("/api/recurring-activities", window.location.origin);
  if (status) url.searchParams.set("status", status);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch recurring activities");
  return res.json();
}

export async function createRecurringActivity(data: {
  activity_type: string;
  title: string;
  description?: string;
  payload?: Record<string, unknown>;
  frequency: string;
  interval?: number;
  days_of_week?: number[];
  day_of_month?: number;
  time_of_day: string;
  timezone: string;
  start_date: string;
  end_after_occurrences?: number;
  end_by_date?: string;
}): Promise<RecurringActivity> {
  const res = await fetch("/api/recurring-activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create recurring activity");
  return res.json();
}

export async function updateRecurringActivity(
  id: string,
  data: Record<string, unknown>
): Promise<RecurringActivity> {
  const res = await fetch(`/api/recurring-activities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update recurring activity");
  return res.json();
}

export async function deleteRecurringActivity(
  id: string,
  cancelFuture = true
): Promise<void> {
  const url = new URL(`/api/recurring-activities/${id}`, window.location.origin);
  if (!cancelFuture) url.searchParams.set("cancel_future", "false");

  const res = await fetch(url.toString(), { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete recurring activity");
}

export async function pauseRecurringActivity(
  id: string,
  status: "paused" | "active"
): Promise<void> {
  const res = await fetch(`/api/recurring-activities/${id}/pause`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update recurring activity status");
}
