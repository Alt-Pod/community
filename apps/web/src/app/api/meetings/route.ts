import {
  auth,
  scheduledActivityService,
  conversationService,
  chatService,
  agentService,
  auditLogService,
} from "@community/backend";
import type { MeetingPayload } from "@community/shared";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let activities;
  if (from && to) {
    activities = await scheduledActivityService.getByDateRange(
      session.user.id,
      from,
      to
    );
  } else {
    activities = await scheduledActivityService.getByUserId(session.user.id, {
      activityType: "meeting",
    });
  }

  // Filter to meetings only
  const meetings = activities.filter((a) => a.activity_type === "meeting");

  // Enrich with agent names for participants
  const agents = await agentService.getAll();
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  const enriched = meetings.map((m) => {
    const payload = m.payload as unknown as MeetingPayload;
    const participants = (payload.participant_agent_ids ?? [])
      .map((id) => agentMap.get(id))
      .filter(Boolean)
      .map((a) => ({ id: a!.id, name: a!.name }));

    return {
      ...m,
      participants,
    };
  });

  return Response.json(enriched);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    agenda,
    participant_agent_ids,
    scheduled_at,
    duration_minutes = 30,
    timezone = "UTC",
  } = body;

  if (!title || !agenda || !participant_agent_ids?.length || !scheduled_at) {
    return Response.json(
      { error: "title, agenda, participant_agent_ids, and scheduled_at are required" },
      { status: 400 }
    );
  }

  if (participant_agent_ids.length < 2) {
    return Response.json(
      { error: "At least 2 participant agents are required" },
      { status: 400 }
    );
  }

  const payload: MeetingPayload = {
    participant_agent_ids,
    agenda,
    duration_minutes,
    timezone,
  };

  const activity = await scheduledActivityService.schedule(session.user.id, {
    activityType: "meeting",
    title,
    description: agenda,
    scheduledAt: scheduled_at,
    payload: payload as unknown as Record<string, unknown>,
  });

  auditLogService.log(session.user.id, "meeting.scheduled", "meeting", activity.id, { title, participant_count: participant_agent_ids.length }).catch(() => {});
  return Response.json(activity, { status: 201 });
}
