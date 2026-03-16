export interface MeetingSummaryItem {
  id: string;
  content: string;
  activityId: string | null;
  activityTitle: string | null;
  summaryTitle: string | null;
  scheduledAt: string | null;
  created_at: string;
}

export async function fetchMeetingSummaries(): Promise<MeetingSummaryItem[]> {
  const res = await fetch("/api/meetings/summaries");
  if (!res.ok) throw new Error("Failed to fetch meeting summaries");
  return res.json();
}
