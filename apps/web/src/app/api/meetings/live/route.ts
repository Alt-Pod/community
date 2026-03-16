import { auth, scheduledActivityService, agentService } from "@community/backend";
import type { MeetingPayload } from "@community/shared";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get meetings in a window: -1 hour to +1 hour from now
  const now = new Date();
  const from = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const to = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  const activities = await scheduledActivityService.getByDateRange(
    session.user.id,
    from,
    to
  );

  const meetings = activities.filter((a) => a.activity_type === "meeting" && a.status !== "cancelled");

  // Also get any currently running meetings (may be outside the time window)
  const allActivities = await scheduledActivityService.getByUserId(session.user.id, {
    status: "running",
    activityType: "meeting",
  });
  const runningMeetings = allActivities.filter(
    (a) => a.activity_type === "meeting" && !meetings.find((m) => m.id === a.id)
  );

  const combined = [...runningMeetings, ...meetings];

  // Deduplicate
  const seen = new Set<string>();
  const unique = combined.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  // Sort: running first, then by scheduled_at
  unique.sort((a, b) => {
    if (a.status === "running" && b.status !== "running") return -1;
    if (b.status === "running" && a.status !== "running") return 1;
    return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
  });

  // Enrich with participants
  const agents = await agentService.getAll();
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  const enriched = unique.map((m) => {
    const payload = m.payload as unknown as MeetingPayload;
    const participants = (payload.participant_agent_ids ?? [])
      .map((id) => agentMap.get(id))
      .filter(Boolean)
      .map((a) => ({ id: a!.id, name: a!.name }));

    return {
      ...m,
      participants,
      conversation_id: payload.conversation_id ?? null,
    };
  });

  return Response.json(enriched);
}
