import { auth, agentService, auditLogService } from "@community/backend";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const agent = await agentService.findById(id);

  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  return Response.json(agent);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    name?: string;
    description?: string | null;
    system_prompt?: string;
    status?: "active" | "inactive";
  };

  const agent = await agentService.update(id, body);

  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  auditLogService.log(session.user.id, "agent.updated", "agent", id, body).catch(() => {});
  return Response.json(agent);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const agent = await agentService.delete(id);

  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  auditLogService.log(session.user.id, "agent.deleted", "agent", id, {}).catch(() => {});
  return new Response(null, { status: 204 });
}
