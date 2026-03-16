import { auth, scheduledActivityService } from "@community/backend";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const activity = await scheduledActivityService.getById(id);

  if (!activity || activity.user_id !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(activity);
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

  try {
    await scheduledActivityService.cancel(id, session.user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel";
    if (message === "Unauthorized") {
      return new Response("Not found", { status: 404 });
    }
    return Response.json({ error: message }, { status: 400 });
  }
}
