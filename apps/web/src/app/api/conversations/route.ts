import { auth, conversationService } from "@community/backend";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const conversations = await conversationService.getByUserId(session.user.id);
  return Response.json(conversations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { title } = (await req.json()) as { title?: string };

  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }

  const conversation = await conversationService.create(session.user.id, title);
  return Response.json(conversation, { status: 201 });
}
