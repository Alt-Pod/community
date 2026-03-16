import {
  inngest,
  agentRepository,
  messageRepository,
  jobService,
  scheduledActivityRepository,
  withJobTracking,
} from "@community/backend";
import {
  INNGEST_FUNCTION_IDS,
  INNGEST_EVENTS,
  MESSAGE_ROLES,
} from "@community/shared";
import type { Agent } from "@community/shared";
import { loadMeetingHistory, generateMasterClosing } from "./meetingHelper";

export const meetingClosing = inngest.createFunction(
  { id: INNGEST_FUNCTION_IDS.MEETING_CLOSING, retries: 1 },
  { event: INNGEST_EVENTS.MEETING_CLOSING },
  async ({ event, step }) => {
    const {
      activityId,
      jobId,
      conversationId,
      userId,
      agenda,
      participantAgentIds,
      durationMinutes,
    } = event.data;

    await step.run("closing", async () => {
      return withJobTracking(
        { jobService, activityRepository: scheduledActivityRepository },
        jobId,
        activityId,
        async () => {
          // Load agents for history
          const agents: Agent[] = [];
          for (const agentId of participantAgentIds) {
            const agent = await agentRepository.findById(agentId);
            if (agent) agents.push(agent);
          }

          const history = await loadMeetingHistory(conversationId, agents);
          const closing = await generateMasterClosing(history);
          console.log(`[meeting] Master closing — content length: ${closing.length}`);

          await messageRepository.create({
            conversationId,
            role: MESSAGE_ROLES.ASSISTANT,
            content: closing,
            agentId: null,
          });
        }
      );
    });

    // Emit summarize event
    await step.sendEvent("trigger-summarize", {
      name: INNGEST_EVENTS.MEETING_SUMMARIZE,
      data: {
        activityId,
        jobId,
        conversationId,
        userId,
        agenda,
        participantAgentIds,
        durationMinutes: durationMinutes ?? 0,
      },
    });

    return { closed: true };
  }
);
