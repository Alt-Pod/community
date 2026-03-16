import { auth, recurringActivityService } from "@community/backend";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const recurring = await recurringActivityService.getById(id);

  if (!recurring || recurring.user_id !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  return Response.json(recurring);
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

  try {
    const body = await req.json();
    const updated = await recurringActivityService.update(id, session.user.id, {
      title: body.title,
      description: body.description,
      payload: body.payload,
      frequency: body.frequency,
      intervalValue: body.interval,
      daysOfWeek: body.days_of_week,
      dayOfMonth: body.day_of_month,
      timeOfDay: body.time_of_day,
      timezone: body.timezone,
      startDate: body.start_date,
      endAfterOccurrences: body.end_after_occurrences,
      endByDate: body.end_by_date,
    });

    return Response.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update";
    if (message === "Unauthorized" || message === "Recurring activity not found") {
      return new Response("Not found", { status: 404 });
    }
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const cancelFuture = url.searchParams.get("cancel_future") !== "false";

  try {
    await recurringActivityService.delete(id, session.user.id, cancelFuture);
    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete";
    if (message === "Unauthorized" || message === "Recurring activity not found") {
      return new Response("Not found", { status: 404 });
    }
    return Response.json({ error: message }, { status: 400 });
  }
}
