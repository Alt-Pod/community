import {
  auth,
  scheduledActivityService,
  chatService,
  agentService,
} from "@community/backend";
import type { MeetingPayload } from "@community/shared";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // Load the scheduled activity
  const activity = await scheduledActivityService.getById(id);
  if (!activity || activity.user_id !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  if (activity.activity_type !== "meeting") {
    return Response.json({ error: "Not a meeting" }, { status: 400 });
  }

  const payload = activity.payload as unknown as MeetingPayload;

  // Load participant agent details
  const agents = await agentService.getAll();
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const participants = (payload.participant_agent_ids ?? [])
    .map((agentId) => agentMap.get(agentId))
    .filter(Boolean)
    .map((a) => ({ id: a!.id, name: a!.name, description: a!.description }));

  // Load meeting transcript if conversation exists
  let messages: unknown[] = [];
  if (payload.conversation_id) {
    messages = await chatService.getMessages(payload.conversation_id);
  }

  return Response.json({
    activity,
    participants,
    messages,
    agenda: payload.agenda,
    duration_minutes: payload.duration_minutes,
    timezone: payload.timezone,
    summary: payload.summary ?? (activity.output as Record<string, unknown>)?.summary ?? null,
    conversation_id: payload.conversation_id ?? null,
  });
}
