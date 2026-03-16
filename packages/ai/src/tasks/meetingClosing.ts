import {
  inngest,
  agentRepository,
  messageRepository,
  jobService,
  scheduledActivityRepository,
  withJobTracking,
} from "@community/backend";
import type { Agent } from "@community/shared";
import { loadMeetingHistory, generateMasterClosing } from "./meetingHelper";

export const meetingClosing = inngest.createFunction(
  { id: "meeting-closing", retries: 1 },
  { event: "meeting/closing" },
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
            role: "assistant",
            content: closing,
            agentId: null,
          });
        }
      );
    });

    // Emit summarize event
    await step.sendEvent("trigger-summarize", {
      name: "meeting/summarize",
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
