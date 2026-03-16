import {
  inngest,
  agentRepository,
  messageRepository,
  conversationService,
  scheduledActivityRepository,
  jobService,
  knowledgeService,
  auditLogService,
  notificationService,
  withJobTracking,
} from "@community/backend";
import {
  INNGEST_FUNCTION_IDS,
  INNGEST_EVENTS,
  MESSAGE_ROLES,
  ACTIVITY_OUTCOME_TYPES,
  NOTIFICATION_TYPE,
} from "@community/shared";
import type { Agent } from "@community/shared";
import { loadMeetingHistory, generateSummary, generateSummaryTitle } from "./meetingHelper";

export const meetingSummary = inngest.createFunction(
  { id: INNGEST_FUNCTION_IDS.MEETING_SUMMARY, retries: 1 },
  { event: INNGEST_EVENTS.MEETING_SUMMARIZE },
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

          // Generate outcome-aware summary
          const { summary, outcome } = await generateSummary(
            history,
            agenda,
            participantNames,
            durationMinutes
          );

          // Generate a short title for the summary
          const summaryTitle = await generateSummaryTitle(summary);

          // Save summary as final message
          await messageRepository.create({
            conversationId,
            role: MESSAGE_ROLES.ASSISTANT,
            content: `---\n\n## Meeting Summary\n\n${summary}`,
            agentId: null,
          });

          // Save summary as knowledge entry
          const knowledgeEntry = await knowledgeService.saveEntry(userId, {
            category: "meeting_summary",
            content: summary,
            source: `meeting:${activityId}`,
          });

          // Mark complete with outcome
          await conversationService.updateEndedAt(conversationId, new Date());
          await scheduledActivityRepository.markCompleted(
            activityId,
            {
              conversation_id: conversationId,
              summary,
              summary_title: summaryTitle,
              participants: participantNames,
            },
            outcome
          );
          await jobService.markCompleted(jobId, {
            activityId,
            conversation_id: conversationId,
            executed: true,
          });

          // Notify user based on outcome
          const notificationBody =
            outcome.type === ACTIVITY_OUTCOME_TYPES.NEEDS_USER_INPUT
              ? `Meeting needs your input: ${outcome.user_prompt || summary}`
              : outcome.type === ACTIVITY_OUTCOME_TYPES.NEEDS_FOLLOW_UP
                ? `Meeting completed but more work is needed: ${outcome.follow_up_hint || summary}`
                : `Your meeting with ${participantNames.join(", ")} has ended. A summary has been generated.`;

          await notificationService.create(userId, {
            title: `Meeting ${outcome.type === ACTIVITY_OUTCOME_TYPES.GOAL_REACHED ? "completed" : outcome.type === ACTIVITY_OUTCOME_TYPES.NEEDS_USER_INPUT ? "needs input" : "needs follow-up"}: ${agenda.slice(0, 50)}`,
            body: notificationBody,
            type: outcome.type === ACTIVITY_OUTCOME_TYPES.NEEDS_USER_INPUT ? NOTIFICATION_TYPE.WARNING : NOTIFICATION_TYPE.MEETING,
            link: `/meetings/${activityId}`,
            conversationId,
            metadata: { activityId, participantNames, outcomeType: outcome.type },
          }).catch(() => {});

          // Audit log
          await auditLogService.log(
            userId,
            "meeting.completed",
            "meeting",
            activityId,
            { title: agenda.slice(0, 80), participants: participantNames, outcomeType: outcome.type, knowledgeEntryId: knowledgeEntry.id }
          ).catch(() => {});

          return { summary, outcome, knowledgeEntryId: knowledgeEntry.id };
        }
      );
    });

    return result;
  }
);
