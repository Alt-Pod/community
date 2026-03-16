import { auth, recurringActivityService } from "@community/backend";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const status = body.status;

    if (status === "paused") {
      await recurringActivityService.pause(id, session.user.id);
    } else if (status === "active") {
      await recurringActivityService.resume(id, session.user.id);
    } else {
      return Response.json({ error: "Invalid status. Use 'paused' or 'active'" }, { status: 400 });
    }

    return Response.json({ success: true, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    if (message === "Unauthorized" || message === "Recurring activity not found") {
      return new Response("Not found", { status: 404 });
    }
    return Response.json({ error: message }, { status: 400 });
  }
}
