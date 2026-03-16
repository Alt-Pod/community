import { auth, usageService } from "@community/backend";
import { USER_ROLES } from "@community/shared";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (session.user.role !== USER_ROLES.ADMIN) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const range = url.searchParams.get("range") ?? "month";

  const now = new Date();
  let from: Date;

  if (range === "today") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "week") {
    from = new Date(now);
    from.setDate(from.getDate() - 7);
    from.setHours(0, 0, 0, 0);
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const stats = await usageService.getStats(from, now);
  return Response.json(stats);
}
