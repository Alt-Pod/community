import { auth, agentService } from "@community/backend";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const agents = await agentService.getAll();
  return Response.json(agents);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { name, description, system_prompt } = (await req.json()) as {
    name?: string;
    description?: string;
    system_prompt?: string;
  };

  if (!name || !system_prompt) {
    return Response.json(
      { error: "name and system_prompt are required" },
      { status: 400 }
    );
  }

  const agent = await agentService.create({ name, description, system_prompt });
  return Response.json(agent, { status: 201 });
}
