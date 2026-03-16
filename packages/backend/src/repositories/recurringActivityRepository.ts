import type { Sql, JSONValue } from "postgres";
import type { RecurringActivity, RecurringActivityStatus } from "@community/shared";

export class RecurringActivityRepository {
  constructor(
    private sql: Sql,
    private table: string = "recurring_activities"
  ) {}

  async create(data: {
    userId: string;
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
  }): Promise<RecurringActivity> {
    const [row] = await this.sql<RecurringActivity[]>`
      INSERT INTO ${this.sql(this.table)} (
        user_id, agent_id, activity_type, title, description, payload,
        frequency, interval_value, days_of_week, day_of_month,
        time_of_day, timezone, start_date,
        end_after_occurrences, end_by_date
      )
      VALUES (
        ${data.userId},
        ${data.agentId ?? null},
        ${data.activityType},
        ${data.title},
        ${data.description ?? null},
        ${this.sql.json((data.payload ?? {}) as JSONValue)},
        ${data.frequency},
        ${data.intervalValue},
        ${data.daysOfWeek ? this.sql.array(data.daysOfWeek) : null},
        ${data.dayOfMonth ?? null},
        ${data.timeOfDay},
        ${data.timezone},
        ${data.startDate},
        ${data.endAfterOccurrences ?? null},
        ${data.endByDate ?? null}
      )
      RETURNING *
    `;
    return row;
  }

  async findById(id: string): Promise<RecurringActivity | null> {
    const [row] = await this.sql<RecurringActivity[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE id = ${id}
    `;
    return row ?? null;
  }

  async findByUserId(
    userId: string,
    filters?: { status?: RecurringActivityStatus; activityType?: string }
  ): Promise<RecurringActivity[]> {
    if (filters?.status && filters?.activityType) {
      return this.sql<RecurringActivity[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND status = ${filters.status} AND activity_type = ${filters.activityType}
        ORDER BY created_at DESC
      `;
    }
    if (filters?.status) {
      return this.sql<RecurringActivity[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND status = ${filters.status}
        ORDER BY created_at DESC
      `;
    }
    if (filters?.activityType) {
      return this.sql<RecurringActivity[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND activity_type = ${filters.activityType}
        ORDER BY created_at DESC
      `;
    }
    return this.sql<RecurringActivity[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  async findActive(): Promise<RecurringActivity[]> {
    return this.sql<RecurringActivity[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE status = 'active'
      ORDER BY created_at ASC
    `;
  }

  async update(
    id: string,
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
  ): Promise<RecurringActivity | null> {
    const sets: string[] = [];
    const values: Record<string, unknown> = {};

    if (data.title !== undefined) { values.title = data.title; sets.push("title"); }
    if (data.description !== undefined) { values.description = data.description; sets.push("description"); }
    if (data.frequency !== undefined) { values.frequency = data.frequency; sets.push("frequency"); }
    if (data.intervalValue !== undefined) { values.interval_value = data.intervalValue; sets.push("interval_value"); }
    if (data.timeOfDay !== undefined) { values.time_of_day = data.timeOfDay; sets.push("time_of_day"); }
    if (data.timezone !== undefined) { values.timezone = data.timezone; sets.push("timezone"); }
    if (data.startDate !== undefined) { values.start_date = data.startDate; sets.push("start_date"); }
    if (data.endAfterOccurrences !== undefined) { values.end_after_occurrences = data.endAfterOccurrences; sets.push("end_after_occurrences"); }
    if (data.endByDate !== undefined) { values.end_by_date = data.endByDate; sets.push("end_by_date"); }

    // Handle special columns that need array/jsonb casting
    // For simplicity, do a full update using a single dynamic query
    const [row] = await this.sql<RecurringActivity[]>`
      UPDATE ${this.sql(this.table)}
      SET
        title = COALESCE(${data.title ?? null}, title),
        description = ${data.description !== undefined ? data.description : this.sql`description`},
        frequency = COALESCE(${data.frequency ?? null}, frequency),
        interval_value = COALESCE(${data.intervalValue ?? null}, interval_value),
        days_of_week = ${data.daysOfWeek !== undefined ? (data.daysOfWeek ? this.sql.array(data.daysOfWeek) : null) : this.sql`days_of_week`},
        day_of_month = ${data.dayOfMonth !== undefined ? data.dayOfMonth : this.sql`day_of_month`},
        time_of_day = COALESCE(${data.timeOfDay ?? null}, time_of_day),
        timezone = COALESCE(${data.timezone ?? null}, timezone),
        start_date = COALESCE(${data.startDate ?? null}, start_date),
        end_after_occurrences = ${data.endAfterOccurrences !== undefined ? data.endAfterOccurrences : this.sql`end_after_occurrences`},
        end_by_date = ${data.endByDate !== undefined ? data.endByDate : this.sql`end_by_date`},
        payload = ${data.payload !== undefined ? this.sql.json(data.payload as JSONValue) : this.sql`payload`},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return row ?? null;
  }

  async updateStatus(id: string, status: RecurringActivityStatus): Promise<void> {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET status = ${status}, updated_at = now()
      WHERE id = ${id}
    `;
  }

  async incrementOccurrences(id: string, count: number): Promise<void> {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET occurrences_created = occurrences_created + ${count},
          last_materialized_at = now(),
          updated_at = now()
      WHERE id = ${id}
    `;
  }
}
