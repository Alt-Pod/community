import { tool, zodSchema } from "ai";
import { z } from "zod";
import { scheduledActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";
import type { MeetingPayload } from "@community/shared";

export const scheduleMeetingTool: CommunityToolDefinition = {
  meta: {
    id: "planning.schedule_meeting",
    category: "planning",
    displayName: "tools.planning.scheduleMeeting.name",
    description: "Schedule a meeting between multiple agents at a specific time with an agenda",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Schedule a meeting between multiple AI agents. The meeting will be orchestrated by a Meeting Master who introduces the agenda, facilitates discussion rounds, and ensures all topics are covered. A summary is automatically generated at the end.",
      inputSchema: zodSchema(
        z.object({
          title: z.string().describe("Short title for the meeting"),
          agenda: z
            .string()
            .describe(
              "The meeting agenda / order of the day. Describe the topics to discuss."
            ),
          participant_agent_ids: z
            .array(z.string())
            .min(2)
            .describe(
              "Array of agent IDs that will participate in the meeting (minimum 2)"
            ),
          scheduled_at: z
            .string()
            .describe(
              "ISO 8601 datetime for when the meeting starts (e.g. 2026-03-20T14:00:00+01:00)"
            ),
          duration_minutes: z
            .number()
            .min(5)
            .max(120)
            .default(30)
            .describe("Meeting duration in minutes (5-120, default 30)"),
          timezone: z
            .string()
            .default("UTC")
            .describe(
              "IANA timezone identifier (e.g. Europe/Paris, America/New_York)"
            ),
        })
      ),
      needsApproval: true,
      execute: async ({
        title,
        agenda,
        participant_agent_ids,
        scheduled_at,
        duration_minutes,
        timezone,
      }) => {
        if (participant_agent_ids.length < 2) {
          return { success: false, error: "At least 2 participant agents are required" };
        }

        const meetingPayload: MeetingPayload = {
          participant_agent_ids,
          agenda,
          duration_minutes,
          timezone,
        };

        const activity = await scheduledActivityService.schedule(ctx.userId, {
          activityType: "meeting",
          title,
          description: agenda,
          scheduledAt: scheduled_at,
          payload: meetingPayload as unknown as Record<string, unknown>,
        });

        return {
          success: true,
          id: activity.id,
          activity_type: "meeting",
          scheduled_at: activity.scheduled_at,
          duration_minutes,
          participant_count: participant_agent_ids.length,
        };
      },
    }),
};
