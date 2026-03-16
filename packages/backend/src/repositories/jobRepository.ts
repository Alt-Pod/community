import type { Sql, JSONValue } from "postgres";

export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export class JobRepository {
  constructor(
    private sql: Sql,
    private table: string = "jobs"
  ) {}

  async create(data: {
    type: string;
    input?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    parentJobId?: string | null;
    userId?: string | null;
  }) {
    const [job] = await this.sql`
      INSERT INTO ${this.sql(this.table)} (type, input, metadata, parent_job_id, user_id)
      VALUES (
        ${data.type},
        ${this.sql.json((data.input ?? {}) as JSONValue)},
        ${this.sql.json((data.metadata ?? {}) as JSONValue)},
        ${data.parentJobId ?? null},
        ${data.userId ?? null}
      )
      RETURNING *
    `;
    return job;
  }

  async findByUserId(userId: string, filters?: { status?: JobStatus; type?: string }) {
    const safeColumns = this.sql`id, type, status, current_step, created_at, updated_at, completed_at`;
    if (filters?.status && filters?.type) {
      return this.sql`
        SELECT ${safeColumns} FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND status = ${filters.status} AND type = ${filters.type}
        ORDER BY created_at DESC
      `;
    }
    if (filters?.status) {
      return this.sql`
        SELECT ${safeColumns} FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND status = ${filters.status}
        ORDER BY created_at DESC
      `;
    }
    if (filters?.type) {
      return this.sql`
        SELECT ${safeColumns} FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND type = ${filters.type}
        ORDER BY created_at DESC
      `;
    }
    return this.sql`
      SELECT ${safeColumns} FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  async findById(id: string) {
    const [job] = await this.sql`
      SELECT * FROM ${this.sql(this.table)}
      WHERE id = ${id}
    `;
    return job ?? null;
  }

  async findByType(type: string, filters?: { status?: JobStatus }) {
    if (filters?.status) {
      return this.sql`
        SELECT * FROM ${this.sql(this.table)}
        WHERE type = ${type} AND status = ${filters.status}
        ORDER BY created_at DESC
      `;
    }
    return this.sql`
      SELECT * FROM ${this.sql(this.table)}
      WHERE type = ${type}
      ORDER BY created_at DESC
    `;
  }

  async findByMetadata(key: string, value: string, filters?: { status?: JobStatus; type?: string }) {
    if (filters?.status && filters?.type) {
      return this.sql`
        SELECT * FROM ${this.sql(this.table)}
        WHERE metadata->>${key} = ${value}
          AND status = ${filters.status}
          AND type = ${filters.type}
        ORDER BY created_at DESC
      `;
    }
    if (filters?.status) {
      return this.sql`
        SELECT * FROM ${this.sql(this.table)}
        WHERE metadata->>${key} = ${value}
          AND status = ${filters.status}
        ORDER BY created_at DESC
      `;
    }
    if (filters?.type) {
      return this.sql`
        SELECT * FROM ${this.sql(this.table)}
        WHERE metadata->>${key} = ${value}
          AND type = ${filters.type}
        ORDER BY created_at DESC
      `;
    }
    return this.sql`
      SELECT * FROM ${this.sql(this.table)}
      WHERE metadata->>${key} = ${value}
      ORDER BY created_at DESC
    `;
  }

  async updateStatus(
    id: string,
    status: JobStatus,
    extra?: { currentStep?: string; progress?: Record<string, unknown>; inngestRunId?: string }
  ) {
    const updates: Record<string, unknown> = { status, updated_at: new Date() };
    if (extra?.currentStep !== undefined) updates.current_step = extra.currentStep;
    if (extra?.inngestRunId !== undefined) updates.inngest_run_id = extra.inngestRunId;

    if (extra?.progress) {
      await this.sql`
        UPDATE ${this.sql(this.table)}
        SET status = ${status},
            current_step = ${extra.currentStep ?? null},
            progress = ${this.sql.json(extra.progress as JSONValue)},
            inngest_run_id = ${extra.inngestRunId ?? null},
            updated_at = now()
        WHERE id = ${id}
      `;
    } else {
      await this.sql`
        UPDATE ${this.sql(this.table)}
        SET status = ${status},
            current_step = ${extra?.currentStep ?? null},
            inngest_run_id = ${extra?.inngestRunId ?? null},
            updated_at = now()
        WHERE id = ${id}
      `;
    }
  }

  async markCompleted(id: string, output: Record<string, unknown>) {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET status = 'completed',
          output = ${this.sql.json(output as JSONValue)},
          updated_at = now(),
          completed_at = now()
      WHERE id = ${id}
    `;
  }

  async markFailed(id: string, error: string) {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET status = 'failed',
          error = ${error},
          updated_at = now(),
          completed_at = now()
      WHERE id = ${id}
    `;
  }
}
