import type { ScheduledActivity, DbMessage } from "@community/shared";

export interface MeetingListItem extends ScheduledActivity {
  participants: { id: string; name: string }[];
}

export interface MeetingDetail {
  activity: ScheduledActivity;
  participants: { id: string; name: string; description: string | null }[];
  messages: DbMessage[];
  agenda: string;
  duration_minutes: number;
  timezone: string;
  summary: string | null;
  conversation_id: string | null;
}

export interface ScheduleMeetingInput {
  title: string;
  agenda: string;
  participant_agent_ids: string[];
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
}

export async function fetchMeetings(params?: {
  from?: string;
  to?: string;
}): Promise<MeetingListItem[]> {
  const url = new URL("/api/meetings", window.location.origin);
  if (params?.from) url.searchParams.set("from", params.from);
  if (params?.to) url.searchParams.set("to", params.to);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch meetings");
  return res.json();
}

export async function fetchMeeting(id: string): Promise<MeetingDetail> {
  const res = await fetch(`/api/meetings/${id}`);
  if (!res.ok) throw new Error("Failed to fetch meeting");
  return res.json();
}

export async function scheduleMeeting(
  data: ScheduleMeetingInput
): Promise<ScheduledActivity> {
  const res = await fetch("/api/meetings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to schedule meeting");
  return res.json();
}
