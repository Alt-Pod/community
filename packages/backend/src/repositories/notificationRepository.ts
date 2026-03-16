import type { Sql, JSONValue } from "postgres";
import type { Notification } from "@community/shared";

export class NotificationRepository {
  constructor(
    private sql: Sql,
    private table: string = "notifications"
  ) {}

  async create(data: {
    userId: string;
    title: string;
    body: string;
    type?: string;
    link?: string | null;
    agentId?: string | null;
    conversationId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<Notification> {
    const [notification] = await this.sql<Notification[]>`
      INSERT INTO ${this.sql(this.table)} (user_id, title, body, type, link, agent_id, conversation_id, metadata)
      VALUES (
        ${data.userId},
        ${data.title},
        ${data.body},
        ${data.type ?? "info"},
        ${data.link ?? null},
        ${data.agentId ?? null},
        ${data.conversationId ?? null},
        ${this.sql.json((data.metadata ?? {}) as JSONValue)}
      )
      RETURNING *
    `;
    return notification;
  }

  async findByUserId(
    userId: string,
    filters?: { unreadOnly?: boolean; limit?: number; offset?: number }
  ): Promise<Notification[]> {
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    if (filters?.unreadOnly) {
      return this.sql<Notification[]>`
        SELECT * FROM ${this.sql(this.table)}
        WHERE user_id = ${userId} AND read = false
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return this.sql<Notification[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  async findById(id: string, userId: string): Promise<Notification | undefined> {
    const [notification] = await this.sql<Notification[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return notification;
  }

  async markRead(id: string, userId: string): Promise<Notification | undefined> {
    const [notification] = await this.sql<Notification[]>`
      UPDATE ${this.sql(this.table)}
      SET read = true
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return notification;
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await this.sql`
      UPDATE ${this.sql(this.table)}
      SET read = true
      WHERE user_id = ${userId} AND read = false
    `;
    return result.count;
  }

  async countUnread(userId: string): Promise<number> {
    const [row] = await this.sql<{ count: string }[]>`
      SELECT COUNT(*) as count FROM ${this.sql(this.table)}
      WHERE user_id = ${userId} AND read = false
    `;
    return parseInt(row.count, 10);
  }

  async deleteById(id: string, userId: string): Promise<Notification | undefined> {
    const [notification] = await this.sql<Notification[]>`
      DELETE FROM ${this.sql(this.table)}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return notification;
  }
}
