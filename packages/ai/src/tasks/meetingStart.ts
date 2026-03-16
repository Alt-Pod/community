import {
  inngest,
  scheduledActivityRepository,
  jobService,
  conversationService,
  agentRepository,
  messageRepository,
  auditLogService,
  withJobTracking,
} from "@community/backend";
import {
  INNGEST_FUNCTION_IDS,
  INNGEST_EVENTS,
  ACTIVITIES,
  ACTIVITY_STATUSES,
  MESSAGE_ROLES,
} from "@community/shared";
import type { MeetingPayload, Agent } from "@community/shared";
import { generateMasterOpening } from "./meetingHelper";

/**
 * Cron: runs every minute and checks for activities that need to start.
 * Dispatches by activity_type:
 * - "meeting" → emits "meeting/ready"
 * - "scheduled_notification" → emits "notification/ready"
 */
export const activityCron = inngest.createFunction(
  { id: INNGEST_FUNCTION_IDS.ACTIVITY_CRON },
  { cron: "* * * * *" }, // every minute
  async ({ step }) => {
    const now = new Date();
    // Look back 5 minutes to catch any that were just missed
    const from = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const to = now.toISOString();

    const activities = await step.run("find-due-activities", async () => {
      const all = await scheduledActivityRepository.findDueActivities(from, to);
      return all.filter((a) => a.status === ACTIVITY_STATUSES.SCHEDULED);
    });

    if (activities.length === 0) {
      return { triggered: 0 };
    }

    // Dispatch each activity by type
    for (const activity of activities) {
      const eventData = {
        activityId: activity.id,
        jobId: activity.job_id ?? "",
        userId: activity.user_id,
      };

      if (activity.activity_type === ACTIVITIES.meeting.id) {
        await step.sendEvent(`trigger-meeting-${activity.id}`, {
          name: INNGEST_EVENTS.MEETING_READY,
          data: eventData,
        });
      } else if (activity.activity_type === ACTIVITIES.scheduled_notification.id) {
        await step.sendEvent(`trigger-notification-${activity.id}`, {
          name: INNGEST_EVENTS.NOTIFICATION_READY,
          data: eventData,
        });
      } else if (activity.activity_type === ACTIVITIES.task.id) {
        await step.sendEvent(`trigger-task-${activity.id}`, {
          name: INNGEST_EVENTS.TASK_READY,
          data: eventData,
        });
      }
    }

    return { triggered: activities.length };
  }
);

/**
 * Fires when a meeting is ready to start (triggered by cron).
 * Creates conversation, generates opening, and kicks off the round chain.
 */
export const meetingStart = inngest.createFunction(
  { id: INNGEST_FUNCTION_IDS.MEETING_START, retries: 2 },
  { event: INNGEST_EVENTS.MEETING_READY },
  async ({ event, step }) => {
    const { activityId, jobId, userId } = event.data;

    // Re-check status (may have been cancelled)
    const activity = await step.run("check-status", async () => {
      return scheduledActivityRepository.findById(activityId);
    });

    if (!activity || activity.status !== ACTIVITY_STATUSES.SCHEDULED) {
      await step.run("skip", async () => {
        if (jobId) {
          await jobService.markCompleted(jobId, { skipped: true, reason: "not_scheduled" });
        }
      });
      return { skipped: true };
    }

    // Mark running
    await step.run("mark-running", async () => {
      await scheduledActivityRepository.updateStatus(activityId, ACTIVITY_STATUSES.RUNNING);
      if (jobId) await jobService.markRunning(jobId);
    });

    // Execute meeting start within job tracking wrapper
    const result = await step.run("start-meeting", async () => {
      return withJobTracking(
        { jobService, activityRepository: scheduledActivityRepository },
        jobId,
        activityId,
        async () => {
          const payload = activity.payload as unknown as MeetingPayload;
          const { participant_agent_ids, agenda, duration_minutes } = payload;

          // Load agents
          const agents: Agent[] = [];
          for (const agentId of participant_agent_ids) {
            const agent = await agentRepository.findById(agentId);
            if (agent) agents.push(agent);
          }

          const participantNames = [...agents.map((a) => a.name), "Assistant"];

          // Create meeting conversation
          const conversation = await conversationService.createMeetingConversation(
            userId,
            `Meeting: ${agenda.slice(0, 80)}`
          );

          // Link conversation to activity
          await scheduledActivityRepository.updatePayload(activityId, {
            ...payload,
            conversation_id: conversation.id,
          });

          // Master opening
          const opening = await generateMasterOpening(agenda, participantNames);
          console.log(`[meeting] Master opening — content length: ${opening.length}`);
          await messageRepository.create({
            conversationId: conversation.id,
            role: MESSAGE_ROLES.ASSISTANT,
            content: opening,
            agentId: null,
          });

          // Audit log
          await auditLogService.log(
            userId,
            "meeting.started",
            "meeting",
            activityId,
            { title: activity.title, participants: participantNames }
          ).catch(() => {});

          const endTime = Date.now() + duration_minutes * 60 * 1000;

          return {
            conversationId: conversation.id,
            participantAgentIds: participant_agent_ids,
            agenda,
            durationMinutes: duration_minutes,
            endTime,
            userId,
          };
        }
      );
    });

    // Emit event for first round
    await step.sendEvent("trigger-first-round", {
      name: INNGEST_EVENTS.MEETING_STARTED,
      data: {
        activityId,
        jobId,
        conversationId: result.conversationId,
        userId: result.userId,
        agenda: result.agenda,
        participantAgentIds: result.participantAgentIds,
        durationMinutes: result.durationMinutes,
        endTime: result.endTime,
      },
    });

    return { conversationId: result.conversationId, participantCount: result.participantAgentIds.length };
  }
);
