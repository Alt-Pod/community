import { auth, toolService } from "@community/backend";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const assignments = await toolService.getAllAssignments();
  return Response.json(assignments);
}
