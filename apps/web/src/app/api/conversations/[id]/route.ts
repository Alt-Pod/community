import { auth, conversationService } from "@community/backend";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const conversation = await conversationService.findById(id, session.user.id);

  if (!conversation) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(conversation);
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
  const deleted = await conversationService.delete(id, session.user.id);

  if (!deleted) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(null, { status: 204 });
}
