import { auth } from "@community/backend";
import { getAllToolMetas } from "@community/ai";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const metas = getAllToolMetas();
  const tools = metas.map((m) => ({
    id: m.id,
    category: m.category,
    name: m.displayName,
    description: m.description,
    requiresConfirmation: m.requiresConfirmation,
  }));
  return Response.json(tools);
}
