import { auth } from "@community/backend";
import { getAllToolMetas } from "@community/ai";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tools = getAllToolMetas();
  return Response.json(tools);
}
