import { auth, logbookService } from "@community/backend";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const entry = await logbookService.getToday(session.user.id);

  if (!entry) {
    return Response.json(null);
  }

  return Response.json(entry);
}
