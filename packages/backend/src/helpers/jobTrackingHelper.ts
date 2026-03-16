interface JobTracker {
  markFailed(id: string, error: string): Promise<void>;
}

interface ActivityTracker {
  markFailed(id: string, error: string): Promise<void>;
}

/**
 * Wraps an async function with job + activity failure tracking.
 * On error, marks both the job and (optionally) the activity as failed,
 * then re-throws so Inngest can retry if configured.
 */
export async function withJobTracking<T>(
  deps: { jobService: JobTracker; activityRepository?: ActivityTracker },
  jobId: string,
  activityId: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    try {
      await deps.jobService.markFailed(jobId, msg);
    } catch {
      // Ignore failure-tracking errors to avoid masking the original error
    }
    if (activityId && deps.activityRepository) {
      try {
        await deps.activityRepository.markFailed(activityId, msg);
      } catch {
        // Ignore failure-tracking errors
      }
    }
    throw error;
  }
}
