import { ACTIVITIES } from "@community/shared";
import type { ScheduledActivityRepository, ScheduledActivityStatus } from "../repositories/scheduledActivityRepository";
import type { JobService } from "./jobService";

export class ScheduledActivityService {
  constructor(
    private repository: ScheduledActivityRepository,
    private jobService: JobService
  ) {}

  async schedule(
    userId: string,
    data: {
      agentId?: string | null;
      activityType: string;
      title: string;
      description?: string | null;
      payload?: Record<string, unknown>;
      scheduledAt: string;
    }
  ) {
    if (!(data.activityType in ACTIVITIES)) {
      throw new Error(`Unknown activity type: ${data.activityType}`);
    }

    const activity = await this.repository.create({
      userId,
      agentId: data.agentId,
      activityType: data.activityType,
      title: data.title,
      description: data.description,
      payload: data.payload ?? {},
      scheduledAt: data.scheduledAt,
    });

    const job = await this.jobService.createJob(
      "activity.execute",
      { activityType: data.activityType },
      { activityId: activity.id, scheduledAt: data.scheduledAt },
      { userId }
    );

    await this.repository.updateJobId(activity.id, job.id);

    return { ...activity, job_id: job.id };
  }

  async getByUserId(
    userId: string,
    filters?: { status?: ScheduledActivityStatus; agentId?: string; activityType?: string }
  ) {
    return this.repository.findByUserId(userId, filters);
  }

  async getByDateRange(userId: string, start: string, end: string, agentId?: string) {
    return this.repository.findByDateRange(userId, start, end, agentId);
  }

  async getById(id: string) {
    return this.repository.findById(id);
  }

  async cancel(id: string, userId: string) {
    const activity = await this.repository.findById(id);
    if (!activity) throw new Error("Scheduled activity not found");
    if (activity.user_id !== userId) throw new Error("Unauthorized");
    if (activity.status !== "scheduled") throw new Error("Only scheduled activities can be cancelled");

    await this.repository.updateStatus(id, "cancelled");
  }
}
