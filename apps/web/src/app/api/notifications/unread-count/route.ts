import { auth, notificationService } from "@community/backend";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const count = await notificationService.countUnread(session.user.id);
  return Response.json({ count });
}
