import { auth, scheduledActivityService } from "@community/backend";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const agentId = url.searchParams.get("agent_id") ?? undefined;

  if (from && to) {
    const activities = await scheduledActivityService.getByDateRange(
      session.user.id,
      from,
      to,
      agentId
    );
    return Response.json(activities);
  }

  const activities = await scheduledActivityService.getByUserId(session.user.id, {
    agentId,
  });
  return Response.json(activities);
}
