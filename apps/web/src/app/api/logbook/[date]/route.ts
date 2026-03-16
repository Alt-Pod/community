import { auth, logbookService } from "@community/backend";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { date } = await params;

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }

  const entry = await logbookService.getByDate(session.user.id, date);

  if (!entry) {
    return Response.json(null);
  }

  return Response.json(entry);
}
