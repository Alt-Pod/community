import { auth, recurringActivityService } from "@community/backend";
import type { RecurringActivityStatus } from "@community/shared";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as RecurringActivityStatus | null;

  const activities = await recurringActivityService.getByUserId(session.user.id, {
    status: status ?? undefined,
  });
  return Response.json(activities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const recurring = await recurringActivityService.create(session.user.id, {
      agentId: body.agent_id,
      activityType: body.activity_type,
      title: body.title,
      description: body.description,
      payload: body.payload ?? {},
      frequency: body.frequency,
      intervalValue: body.interval ?? 1,
      daysOfWeek: body.days_of_week,
      dayOfMonth: body.day_of_month,
      timeOfDay: body.time_of_day,
      timezone: body.timezone ?? "UTC",
      startDate: body.start_date,
      endAfterOccurrences: body.end_after_occurrences,
      endByDate: body.end_by_date,
    });

    return Response.json(recurring, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create recurring activity";
    return Response.json({ error: message }, { status: 400 });
  }
}
