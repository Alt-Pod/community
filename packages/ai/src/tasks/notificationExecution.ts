import {
  inngest,
  scheduledActivityRepository,
  jobService,
  notificationService,
} from "@community/backend";
import {
  INNGEST_FUNCTION_IDS,
  INNGEST_EVENTS,
  ACTIVITY_STATUSES,
} from "@community/shared";
import type { ScheduledNotificationPayload } from "@community/shared";

/**
 * Fires when a scheduled notification is ready to be delivered (triggered by activityCron).
 * Creates the notification and marks the activity completed.
 */
export const notificationExecution = inngest.createFunction(
  { id: INNGEST_FUNCTION_IDS.NOTIFICATION_EXECUTION, retries: 2 },
  { event: INNGEST_EVENTS.NOTIFICATION_READY },
  async ({ event, step }) => {
    const { activityId, jobId, userId } = event.data;

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

    await step.run("mark-running", async () => {
      await scheduledActivityRepository.updateStatus(activityId, ACTIVITY_STATUSES.RUNNING);
      if (jobId) await jobService.markRunning(jobId);
    });

    await step.run("send-notification", async () => {
      const payload = activity.payload as unknown as ScheduledNotificationPayload;

      const notification = await notificationService.create(userId, {
        title: payload.title,
        body: payload.body,
        type: (payload.type as "scheduled") ?? "scheduled",
        link: payload.link ?? null,
      });

      await scheduledActivityRepository.markCompleted(activityId, {
        notification_id: notification.id,
      });
      if (jobId) {
        await jobService.markCompleted(jobId, {
          activityId,
          notification_id: notification.id,
        });
      }
    });

    return { activityId, delivered: true };
  }
);
