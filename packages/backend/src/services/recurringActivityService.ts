import { ACTIVITIES, RECURRING_ACTIVITY_STATUSES, ACTIVITY_STATUSES } from "@community/shared";
import type { RecurringActivity, RecurringActivityStatus } from "@community/shared";
import type { RecurringActivityRepository } from "../repositories/recurringActivityRepository";
import type { ScheduledActivityRepository } from "../repositories/scheduledActivityRepository";
import type { JobService } from "./jobService";
import { computeNextOccurrences, type RecurrenceRule } from "../helpers/recurrenceHelper";

const MATERIALIZATION_HORIZON_DAYS = 30;

export class RecurringActivityService {
  constructor(
    private repository: RecurringActivityRepository,
    private scheduledActivityRepository: ScheduledActivityRepository,
    private jobService: JobService
  ) {}

  async create(
    userId: string,
    data: {
      agentId?: string | null;
      activityType: string;
      title: string;
      description?: string | null;
      payload?: Record<string, unknown>;
      frequency: string;
      intervalValue: number;
      daysOfWeek?: number[] | null;
      dayOfMonth?: number | null;
      timeOfDay: string;
      timezone: string;
      startDate: string;
      endAfterOccurrences?: number | null;
      endByDate?: string | null;
    }
  ): Promise<RecurringActivity> {
    if (!(data.activityType in ACTIVITIES)) {
      throw new Error(`Unknown activity type: ${data.activityType}`);
    }

    const recurring = await this.repository.create({
      userId,
      agentId: data.agentId,
      activityType: data.activityType,
      title: data.title,
      description: data.description,
      payload: data.payload ?? {},
      frequency: data.frequency,
      intervalValue: data.intervalValue,
      daysOfWeek: data.daysOfWeek,
      dayOfMonth: data.dayOfMonth,
      timeOfDay: data.timeOfDay,
      timezone: data.timezone,
      startDate: data.startDate,
      endAfterOccurrences: data.endAfterOccurrences,
      endByDate: data.endByDate,
    });

    // Immediately materialize first batch
    await this.materializeInstances(recurring);

    return recurring;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{
      title: string;
      description: string | null;
      payload: Record<string, unknown>;
      frequency: string;
      intervalValue: number;
      daysOfWeek: number[] | null;
      dayOfMonth: number | null;
      timeOfDay: string;
      timezone: string;
      startDate: string;
      endAfterOccurrences: number | null;
      endByDate: string | null;
    }>
  ): Promise<RecurringActivity> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error("Recurring activity not found");
    if (existing.user_id !== userId) throw new Error("Unauthorized");
    if (existing.status === RECURRING_ACTIVITY_STATUSES.DELETED) throw new Error("Cannot update a deleted recurring activity");

    // Check if schedule-affecting fields changed
    const scheduleFields = ["frequency", "intervalValue", "daysOfWeek", "dayOfMonth", "timeOfDay", "timezone", "startDate"];
    const scheduleChanged = scheduleFields.some((f) => (data as Record<string, unknown>)[f] !== undefined);

    const updated = await this.repository.update(id, data);
    if (!updated) throw new Error("Failed to update recurring activity");

    // If schedule changed, cancel future instances and re-materialize
    if (scheduleChanged) {
      await this.scheduledActivityRepository.cancelByRecurringActivityId(id);
      await this.materializeInstances(updated);
    }

    return updated;
  }

  async pause(id: string, userId: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error("Recurring activity not found");
    if (existing.user_id !== userId) throw new Error("Unauthorized");
    if (existing.status !== RECURRING_ACTIVITY_STATUSES.ACTIVE) throw new Error("Only active recurring activities can be paused");

    await this.repository.updateStatus(id, RECURRING_ACTIVITY_STATUSES.PAUSED);
  }

  async resume(id: string, userId: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error("Recurring activity not found");
    if (existing.user_id !== userId) throw new Error("Unauthorized");
    if (existing.status !== RECURRING_ACTIVITY_STATUSES.PAUSED) throw new Error("Only paused recurring activities can be resumed");

    await this.repository.updateStatus(id, RECURRING_ACTIVITY_STATUSES.ACTIVE);
    // Re-materialize from now
    const refreshed = await this.repository.findById(id);
    if (refreshed) await this.materializeInstances(refreshed);
  }

  async delete(id: string, userId: string, cancelFutureInstances = true): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error("Recurring activity not found");
    if (existing.user_id !== userId) throw new Error("Unauthorized");

    await this.repository.updateStatus(id, RECURRING_ACTIVITY_STATUSES.DELETED);

    if (cancelFutureInstances) {
      await this.scheduledActivityRepository.cancelByRecurringActivityId(id);
    }
  }

  async getByUserId(
    userId: string,
    filters?: { status?: RecurringActivityStatus; activityType?: string }
  ): Promise<RecurringActivity[]> {
    return this.repository.findByUserId(userId, filters);
  }

  async getById(id: string): Promise<RecurringActivity | null> {
    return this.repository.findById(id);
  }

  /**
   * Materialize scheduled_activity instances for a recurring activity
   * up to MATERIALIZATION_HORIZON_DAYS days in the future.
   */
  async materializeInstances(recurring: RecurringActivity): Promise<number> {
    const now = new Date();
    const horizon = new Date(now.getTime() + MATERIALIZATION_HORIZON_DAYS * 24 * 60 * 60 * 1000);

    // PostgreSQL DATE/TIME columns are returned as Date objects by the driver,
    // but computeNextOccurrences expects string formats ("YYYY-MM-DD" / "HH:MM").
    const toDateStr = (v: unknown): string => {
      if (v instanceof Date) return v.toISOString().split("T")[0];
      return String(v);
    };
    const toTimeStr = (v: unknown): string => {
      if (v instanceof Date) {
        return `${String(v.getUTCHours()).padStart(2, "0")}:${String(v.getUTCMinutes()).padStart(2, "0")}`;
      }
      return String(v);
    };

    const rule: RecurrenceRule = {
      frequency: recurring.frequency,
      interval_value: recurring.interval_value,
      days_of_week: recurring.days_of_week,
      day_of_month: recurring.day_of_month,
      time_of_day: toTimeStr(recurring.time_of_day),
      timezone: recurring.timezone,
      start_date: toDateStr(recurring.start_date),
      end_after_occurrences: recurring.end_after_occurrences,
      end_by_date: recurring.end_by_date ? toDateStr(recurring.end_by_date) : null,
      occurrences_created: recurring.occurrences_created,
    };

    const occurrences = computeNextOccurrences(rule, now, horizon);
    if (occurrences.length === 0) return 0;

    // Check existing instances to avoid duplicates
    const existing = await this.scheduledActivityRepository.findByRecurringActivityId(
      recurring.id,
      ACTIVITY_STATUSES.SCHEDULED
    );
    const existingTimes = new Set(existing.map((a) => new Date(a.scheduled_at).getTime()));

    let created = 0;
    for (const occurrence of occurrences) {
      const scheduledAt = occurrence.toISOString();
      if (existingTimes.has(occurrence.getTime())) continue;

      const activity = await this.scheduledActivityRepository.create({
        userId: recurring.user_id,
        agentId: recurring.agent_id,
        activityType: recurring.activity_type,
        title: recurring.title,
        description: recurring.description,
        payload: recurring.payload,
        scheduledAt,
        recurringActivityId: recurring.id,
      });

      // Create associated job
      const job = await this.jobService.createJob(
        "activity.execute",
        { activityType: recurring.activity_type },
        { activityId: activity.id, scheduledAt, activityType: recurring.activity_type },
        { userId: recurring.user_id }
      );
      await this.scheduledActivityRepository.updateJobId(activity.id, job.id);

      created++;
    }

    if (created > 0) {
      await this.repository.incrementOccurrences(recurring.id, created);
    }

    return created;
  }
}
