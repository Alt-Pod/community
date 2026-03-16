import { inngest, scheduledActivityRepository, jobService } from "@community/backend";

/**
 * Handles non-meeting activity execution.
 * Meetings are handled by the meetingStart function chain.
 */
export const activityExecution = inngest.createFunction(
  { id: "activity-execution", retries: 2 },
  {
    event: "job/started",
    if: "event.data.type == 'activity.execute' && event.data.metadata.activityType != 'meeting'",
  },
  async ({ event, step }) => {
    const { jobId, metadata } = event.data;
    const activityId = metadata.activityId as string;

    const activity = await step.run("load-activity", async () => {
      return scheduledActivityRepository.findById(activityId);
    });

    if (!activity || activity.status === "cancelled") {
      await step.run("skip-cancelled", async () => {
        await jobService.markCompleted(jobId, { skipped: true, reason: "cancelled" });
      });
      return;
    }

    await step.sleepUntil("wait-until-scheduled", new Date(activity.scheduled_at));

    // Re-check status after sleeping (may have been cancelled while waiting)
    const current = await step.run("recheck-status", async () => {
      return scheduledActivityRepository.findById(activityId);
    });

    if (!current || current.status === "cancelled") {
      await step.run("skip-cancelled-after-sleep", async () => {
        await jobService.markCompleted(jobId, { skipped: true, reason: "cancelled_while_waiting" });
      });
      return;
    }

    await step.run("mark-running", async () => {
      await scheduledActivityRepository.updateStatus(activityId, "running");
      await jobService.markRunning(jobId);
    });

    // Default: mark completed (placeholder for future activity types)
    await step.run("execute", async () => {
      await scheduledActivityRepository.markCompleted(activityId, { executed: true });
      await jobService.markCompleted(jobId, { activityId, executed: true });
    });
  }
);
