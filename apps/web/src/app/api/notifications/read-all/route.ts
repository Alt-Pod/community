import { auth, notificationService } from "@community/backend";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const count = await notificationService.markAllRead(session.user.id);
  return Response.json({ count });
}
