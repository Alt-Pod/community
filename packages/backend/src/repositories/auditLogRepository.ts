import type { Sql, JSONValue } from "postgres";
import type { AuditLog } from "@community/shared";

export class AuditLogRepository {
  constructor(
    private sql: Sql,
    private table: string = "audit_logs"
  ) {}

  async create(data: {
    eventType: string;
    entityType: string;
    entityId?: string | null;
    userId: string;
    details?: Record<string, unknown>;
  }): Promise<AuditLog> {
    const [row] = await this.sql<AuditLog[]>`
      INSERT INTO ${this.sql(this.table)} (event_type, entity_type, entity_id, user_id, details)
      VALUES (
        ${data.eventType},
        ${data.entityType},
        ${data.entityId ?? null},
        ${data.userId},
        ${this.sql.json((data.details ?? {}) as JSONValue)}
      )
      RETURNING *
    `;
    return row;
  }

  async findByUserId(
    userId: string,
    filters?: {
      eventType?: string;
      entityType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<AuditLog[]> {
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    if (filters?.eventType && filters?.entityType) {
      return this.sql<AuditLog[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId}
          AND event_type = ${filters.eventType}
          AND entity_type = ${filters.entityType}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    if (filters?.eventType) {
      return this.sql<AuditLog[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND event_type = ${filters.eventType}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    if (filters?.entityType) {
      return this.sql<AuditLog[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND entity_type = ${filters.entityType}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return this.sql<AuditLog[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  async findByEntity(
    entityType: string,
    entityId: string
  ): Promise<AuditLog[]> {
    return this.sql<AuditLog[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}
      ORDER BY created_at DESC
    `;
  }
}
