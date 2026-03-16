import {
  inngest,
  agentRepository,
  messageRepository,
  conversationService,
  scheduledActivityRepository,
  jobService,
  knowledgeService,
  auditLogService,
  withJobTracking,
} from "@community/backend";
import type { Agent } from "@community/shared";
import { loadMeetingHistory, generateSummary } from "./meetingHelper";

export const meetingSummary = inngest.createFunction(
  { id: "meeting-summary", retries: 1 },
  { event: "meeting/summarize" },
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

    const result = await step.run("summarize", async () => {
      return withJobTracking(
        { jobService, activityRepository: scheduledActivityRepository },
        jobId,
        activityId,
        async () => {
          // Load agents
          const agents: Agent[] = [];
          for (const agentId of participantAgentIds) {
            const agent = await agentRepository.findById(agentId);
            if (agent) agents.push(agent);
          }

          const participantNames = agents.map((a) => a.name);
          const history = await loadMeetingHistory(conversationId, agents);

          // Generate summary
          const summary = await generateSummary(
            history,
            agenda,
            participantNames,
            durationMinutes
          );

          // Save summary as final message
          await messageRepository.create({
            conversationId,
            role: "assistant",
            content: `---\n\n## Meeting Summary\n\n${summary}`,
            agentId: null,
          });

          // Save summary as knowledge entry
          const knowledgeEntry = await knowledgeService.saveEntry(userId, {
            category: "meeting_summary",
            content: summary,
            source: `meeting:${activityId}`,
          });

          // Mark complete
          await conversationService.updateEndedAt(conversationId, new Date());
          await scheduledActivityRepository.markCompleted(activityId, {
            conversation_id: conversationId,
            summary,
            participants: participantNames,
          });
          await jobService.markCompleted(jobId, {
            activityId,
            conversation_id: conversationId,
            executed: true,
          });

          // Audit log
          await auditLogService.log(
            userId,
            "meeting.completed",
            "meeting",
            activityId,
            { title: agenda.slice(0, 80), participants: participantNames, knowledgeEntryId: knowledgeEntry.id }
          ).catch(() => {});

          return { summary, knowledgeEntryId: knowledgeEntry.id };
        }
      );
    });

    return result;
  }
);
