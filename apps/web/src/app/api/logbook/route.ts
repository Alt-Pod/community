import { auth, logbookService } from "@community/backend";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "30", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const entries = await logbookService.list(session.user.id, { limit, offset });

  return Response.json(entries);
}
