import { auth, notificationService } from "@community/backend";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const notification = await notificationService.markRead(id, session.user.id);

  if (!notification) {
    return Response.json({ error: "Notification not found" }, { status: 404 });
  }

  return Response.json(notification);
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
  const deleted = await notificationService.delete(id, session.user.id);

  if (!deleted) {
    return Response.json({ error: "Notification not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
