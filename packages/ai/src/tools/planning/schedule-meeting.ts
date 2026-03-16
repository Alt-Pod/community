import { tool, zodSchema } from "ai";
import { z } from "zod";
import { scheduledActivityService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";
import { ACTIVITIES } from "@community/shared";
import type { MeetingPayload } from "@community/shared";

export const scheduleMeetingTool: CommunityToolDefinition = {
  meta: {
    id: "planning.schedule_meeting",
    category: "planning",
    displayName: "tools.planning.scheduleMeeting.name",
    description: "Schedule a meeting between multiple agents with an agenda. Starts ASAP by default.",
    requiresConfirmation: true,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Schedule a meeting between multiple AI agents. The meeting will be orchestrated by a Meeting Master who introduces the agenda, facilitates discussion rounds, and ensures all topics are covered. A summary is automatically generated at the end. If no scheduled_at is provided, the meeting starts as soon as possible.",
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
            .describe(
              "Array of agent IDs that will participate in the meeting."
            ),
          scheduled_at: z
            .string()
            .optional()
            .describe(
              "ISO 8601 datetime for when the meeting starts. If omitted, the meeting starts as soon as possible."
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
          include_assistant: z
            .boolean()
            .default(false)
            .describe(
              "Whether the default assistant should participate alongside the agents (default: false)"
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
        include_assistant,
      }) => {
        const meetingPayload: MeetingPayload = {
          participant_agent_ids,
          agenda,
          duration_minutes,
          timezone,
          include_assistant,
        };

        const activity = await scheduledActivityService.schedule(ctx.userId, {
          activityType: ACTIVITIES.meeting.id,
          title,
          description: agenda,
          scheduledAt: scheduled_at || new Date().toISOString(),
          payload: meetingPayload as unknown as Record<string, unknown>,
        });

        return {
          success: true,
          id: activity.id,
          activity_type: ACTIVITIES.meeting.id,
          scheduled_at: activity.scheduled_at,
          duration_minutes,
          participant_count: participant_agent_ids.length,
        };
      },
    }),
};
