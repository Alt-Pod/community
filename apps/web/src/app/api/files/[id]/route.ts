import { auth, fileService, auditLogService } from "@community/backend";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const file = await fileService.getFile(id, session.user.id);

  if (!file) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  return Response.json(file);
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
  const { metadata } = (await req.json()) as {
    metadata: Record<string, unknown>;
  };

  if (!metadata) {
    return Response.json({ error: "Metadata is required" }, { status: 400 });
  }

  const file = await fileService.updateFileMetadata(
    id,
    session.user.id,
    metadata
  );

  if (!file) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  return Response.json(file);
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
  const deleted = await fileService.deleteFile(id, session.user.id);

  if (!deleted) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  auditLogService.log(session.user.id, "file.deleted", "file", id, {}).catch(() => {});
  return new Response(null, { status: 204 });
}
