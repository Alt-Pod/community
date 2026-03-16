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
import type { MeetingPayload, Agent } from "@community/shared";
import { generateMasterOpening } from "./meetingHelper";

/**
 * Cron: runs every minute and checks for meetings that need to start.
 * Emits "meeting/ready" for each meeting whose scheduled_at has passed
 * and status is still "scheduled".
 */
export const meetingCron = inngest.createFunction(
  { id: "meeting-cron" },
  { cron: "* * * * *" }, // every minute
  async ({ step }) => {
    const now = new Date();
    // Find meetings scheduled in the past that haven't started yet
    // We look back 5 minutes to catch any that were just missed
    const from = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const to = now.toISOString();

    const activities = await step.run("find-due-meetings", async () => {
      // Get all scheduled activities in the time window
      // We can't filter by activityType in the repository, so we filter in code
      const all = await scheduledActivityRepository.findDueActivities(from, to);
      return all.filter((a) => a.activity_type === "meeting" && a.status === "scheduled");
    });

    if (activities.length === 0) {
      return { triggered: 0 };
    }

    // Emit a meeting/ready event for each due meeting
    for (const activity of activities) {
      await step.sendEvent(`trigger-meeting-${activity.id}`, {
        name: "meeting/ready",
        data: {
          activityId: activity.id,
          jobId: activity.job_id ?? "",
          userId: activity.user_id,
        },
      });
    }

    return { triggered: activities.length };
  }
);

/**
 * Fires when a meeting is ready to start (triggered by cron).
 * Creates conversation, generates opening, and kicks off the round chain.
 */
export const meetingStart = inngest.createFunction(
  { id: "meeting-start", retries: 2 },
  { event: "meeting/ready" },
  async ({ event, step }) => {
    const { activityId, jobId, userId } = event.data;

    // Re-check status (may have been cancelled)
    const activity = await step.run("check-status", async () => {
      return scheduledActivityRepository.findById(activityId);
    });

    if (!activity || activity.status !== "scheduled") {
      await step.run("skip", async () => {
        if (jobId) {
          await jobService.markCompleted(jobId, { skipped: true, reason: "not_scheduled" });
        }
      });
      return { skipped: true };
    }

    // Mark running
    await step.run("mark-running", async () => {
      await scheduledActivityRepository.updateStatus(activityId, "running");
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

          if (agents.length < 2) {
            throw new Error("At least 2 valid participant agents are required");
          }

          const participantNames = agents.map((a) => a.name);

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
          await messageRepository.create({
            conversationId: conversation.id,
            role: "assistant",
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
      name: "meeting/started",
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
