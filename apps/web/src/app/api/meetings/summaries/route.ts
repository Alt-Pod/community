import { auth, knowledgeService, scheduledActivityService } from "@community/backend";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch meeting summary knowledge entries
  const entries = await knowledgeService.getEntries(session.user.id, {
    category: "meeting_summary",
  });

  // Enrich each entry with activity metadata
  const summaries = await Promise.all(
    entries.map(async (entry: { id: string; content: string; source: string | null; created_at: string }) => {
      let activityTitle = null;
      let activityId = null;
      let scheduledAt = null;
      let summaryTitle = null;

      if (entry.source?.startsWith("meeting:")) {
        activityId = entry.source.replace("meeting:", "");
        const activity = await scheduledActivityService.getById(activityId);
        if (activity) {
          activityTitle = activity.title;
          scheduledAt = activity.scheduled_at;
          const output = activity.output as Record<string, unknown> | null;
          summaryTitle = (output?.summary_title as string) ?? null;
        }
      }

      return {
        id: entry.id,
        content: entry.content,
        activityId,
        activityTitle,
        summaryTitle,
        scheduledAt,
        created_at: entry.created_at,
      };
    })
  );

  return Response.json(summaries);
}
