import { auth, toolService } from "@community/backend";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const toolIds = await toolService.getToolsForAgent(id);
  return Response.json(toolIds);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const { toolIds } = (await req.json()) as { toolIds: string[] };

  if (!Array.isArray(toolIds)) {
    return Response.json(
      { error: "toolIds must be an array" },
      { status: 400 }
    );
  }

  await toolService.setAgentTools(id, toolIds);
  return Response.json({ success: true });
}
