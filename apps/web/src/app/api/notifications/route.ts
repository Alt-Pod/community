import { auth, notificationService } from "@community/backend";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const notifications = await notificationService.list(session.user.id, {
    unreadOnly,
    limit,
    offset,
  });

  return Response.json(notifications);
}
