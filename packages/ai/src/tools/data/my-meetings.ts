import { tool, zodSchema } from "ai";
import { z } from "zod";
import { scheduledActivityService, agentService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";
import type { MeetingPayload } from "@community/shared";

export const myMeetingsTool: CommunityToolDefinition = {
  meta: {
    id: "data.my_meetings",
    category: "data",
    displayName: "tools.data.myMeetings.name",
    description: "List the user's scheduled meetings",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "List the current user's meetings (scheduled activities of type 'meeting'). Shows meeting title, agenda, participants, scheduled time, status, and conversation ID (if started). Optionally filter by status.",
      inputSchema: zodSchema(
        z.object({
          status: z
            .enum(["scheduled", "running", "completed", "failed", "cancelled"])
            .optional()
            .describe("Filter by meeting status"),
        })
      ),
      execute: async ({ status }) => {
        const activities = await scheduledActivityService.getByUserId(
          ctx.userId,
          {
            activityType: "meeting",
            status,
          }
        );

        const meetings = activities.filter(
          (a) => a.activity_type === "meeting"
        );

        // Enrich with participant names
        const agents = await agentService.getAll();
        const agentMap = new Map(agents.map((a) => [a.id, a.name]));

        return meetings.map((m) => {
          const payload = m.payload as unknown as MeetingPayload;
          const participants = (payload.participant_agent_ids ?? [])
            .map((id) => agentMap.get(id) ?? id)
            ;

          return {
            id: m.id,
            title: m.title,
            agenda: payload.agenda,
            participants,
            duration_minutes: payload.duration_minutes,
            timezone: payload.timezone,
            scheduled_at: m.scheduled_at,
            status: m.status,
            conversation_id: payload.conversation_id ?? null,
          };
        });
      },
    }),
};
