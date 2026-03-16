import type { Sql, JSONValue } from "postgres";
import type { ScheduledActivity } from "@community/shared";

export type ScheduledActivityStatus = "scheduled" | "running" | "completed" | "failed" | "cancelled";

export class ScheduledActivityRepository {
  constructor(
    private sql: Sql,
    private table: string = "scheduled_activities"
  ) {}

  async create(data: {
    userId: string;
    agentId?: string | null;
    activityType: string;
    title: string;
    description?: string | null;
    payload?: Record<string, unknown>;
    scheduledAt: string;
    jobId?: string | null;
    recurringActivityId?: string | null;
  }): Promise<ScheduledActivity> {
    const [row] = await this.sql<ScheduledActivity[]>`
      INSERT INTO ${this.sql(this.table)} (user_id, agent_id, activity_type, title, description, payload, scheduled_at, job_id, recurring_activity_id)
      VALUES (
        ${data.userId},
        ${data.agentId ?? null},
        ${data.activityType},
        ${data.title},
        ${data.description ?? null},
        ${this.sql.json((data.payload ?? {}) as JSONValue)},
        ${data.scheduledAt},
        ${data.jobId ?? null},
        ${data.recurringActivityId ?? null}
      )
      RETURNING *
    `;
    return row;
  }

  async findById(id: string): Promise<ScheduledActivity | null> {
    const [row] = await this.sql<ScheduledActivity[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE id = ${id}
    `;
    return row ?? null;
  }

  async findByUserId(
    userId: string,
    filters?: { status?: ScheduledActivityStatus; agentId?: string; activityType?: string }
  ): Promise<ScheduledActivity[]> {
    if (filters?.status && filters?.agentId) {
      return this.sql<ScheduledActivity[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND status = ${filters.status} AND agent_id = ${filters.agentId}
        ORDER BY scheduled_at ASC
      `;
    }
    if (filters?.status) {
      return this.sql<ScheduledActivity[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND status = ${filters.status}
        ORDER BY scheduled_at ASC
      `;
    }
    if (filters?.agentId) {
      return this.sql<ScheduledActivity[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND agent_id = ${filters.agentId}
        ORDER BY scheduled_at ASC
      `;
    }
    return this.sql<ScheduledActivity[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY scheduled_at ASC
    `;
  }

  async findByDateRange(
    userId: string,
    start: string,
    end: string,
    agentId?: string
  ): Promise<ScheduledActivity[]> {
    if (agentId) {
      return this.sql<ScheduledActivity[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId}
          AND scheduled_at >= ${start}
          AND scheduled_at < ${end}
          AND agent_id = ${agentId}
        ORDER BY scheduled_at ASC
      `;
    }
    return this.sql<ScheduledActivity[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
        AND scheduled_at >= ${start}
        AND scheduled_at < ${end}
      ORDER BY scheduled_at ASC
    `;
  }

  async updateStatus(id: string, status: ScheduledActivityStatus): Promise<void> {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET status = ${status}, updated_at = now()
      WHERE id = ${id}
    `;
  }

  async markCompleted(id: string, output: Record<string, unknown>): Promise<void> {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET status = 'completed',
          output = ${this.sql.json(output as JSONValue)},
          updated_at = now(),
          completed_at = now()
      WHERE id = ${id}
    `;
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET status = 'failed',
          error = ${error},
          updated_at = now(),
          completed_at = now()
      WHERE id = ${id}
    `;
  }

  async findDueActivities(
    from: string,
    to: string
  ): Promise<ScheduledActivity[]> {
    return this.sql<ScheduledActivity[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE scheduled_at >= ${from}
        AND scheduled_at <= ${to}
        AND status = 'scheduled'
      ORDER BY scheduled_at ASC
    `;
  }

  async updatePayload(id: string, payload: Record<string, unknown>): Promise<void> {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET payload = ${this.sql.json(payload as JSONValue)}, updated_at = now()
      WHERE id = ${id}
    `;
  }

  async updateJobId(id: string, jobId: string): Promise<void> {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET job_id = ${jobId}, updated_at = now()
      WHERE id = ${id}
    `;
  }

  async cancelByRecurringActivityId(recurringActivityId: string): Promise<number> {
    const result = await this.sql`
      UPDATE ${this.sql(this.table)}
      SET status = 'cancelled', updated_at = now()
      WHERE recurring_activity_id = ${recurringActivityId}
        AND status = 'scheduled'
    `;
    return result.count;
  }

  async findByRecurringActivityId(
    recurringActivityId: string,
    status?: ScheduledActivityStatus
  ): Promise<ScheduledActivity[]> {
    if (status) {
      return this.sql<ScheduledActivity[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE recurring_activity_id = ${recurringActivityId} AND status = ${status}
        ORDER BY scheduled_at ASC
      `;
    }
    return this.sql<ScheduledActivity[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE recurring_activity_id = ${recurringActivityId}
      ORDER BY scheduled_at ASC
    `;
  }
}
