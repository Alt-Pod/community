import { auth, auditLogService } from "@community/backend";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const eventType = url.searchParams.get("event_type") ?? undefined;
  const entityType = url.searchParams.get("entity_type") ?? undefined;
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const logs = await auditLogService.getByUserId(session.user.id, {
    eventType,
    entityType,
    limit: Math.min(limit, 100),
    offset,
  });

  return Response.json(logs);
}
