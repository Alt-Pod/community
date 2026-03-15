import { auth } from "@/lib/auth";
import sql from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const [conversation] = await sql`
    SELECT id, title, created_at
    FROM conversations
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  if (!conversation) {
    return new Response("Not found", { status: 404 });
  }

  const messages = await sql`
    SELECT id, role, content, agent_id, created_at
    FROM messages
    WHERE conversation_id = ${id}
    ORDER BY created_at ASC
  `;

  return Response.json({ ...conversation, messages });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  // Delete messages first (in case ON DELETE CASCADE is not applied)
  await sql`DELETE FROM messages WHERE conversation_id = ${id}`;

  const [conversation] = await sql`
    DELETE FROM conversations
    WHERE id = ${id} AND user_id = ${session.user.id}
    RETURNING id
  `;

  if (!conversation) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(null, { status: 204 });
}
