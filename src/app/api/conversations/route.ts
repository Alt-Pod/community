import { auth } from "@/lib/auth";
import sql from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const conversations = await sql`
    SELECT id, title, created_at
    FROM conversations
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `;

  return Response.json(conversations);
}
