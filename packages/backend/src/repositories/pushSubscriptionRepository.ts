import type { Sql } from "postgres";
import type { PushSubscriptionRecord } from "@community/shared";

export class PushSubscriptionRepository {
  constructor(
    private sql: Sql,
    private table: string = "push_subscriptions"
  ) {}

  async upsert(data: {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string | null;
  }): Promise<PushSubscriptionRecord> {
    const [sub] = await this.sql<PushSubscriptionRecord[]>`
      INSERT INTO ${this.sql(this.table)} (user_id, endpoint, p256dh, auth, user_agent)
      VALUES (${data.userId}, ${data.endpoint}, ${data.p256dh}, ${data.auth}, ${data.userAgent ?? null})
      ON CONFLICT (endpoint) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_agent = EXCLUDED.user_agent
      RETURNING *
    `;
    return sub;
  }

  async findByUserId(userId: string): Promise<PushSubscriptionRecord[]> {
    return this.sql<PushSubscriptionRecord[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
    `;
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.sql`
      DELETE FROM ${this.sql(this.table)}
      WHERE endpoint = ${endpoint}
    `;
  }

  async deleteById(id: string, userId: string): Promise<PushSubscriptionRecord | undefined> {
    const [sub] = await this.sql<PushSubscriptionRecord[]>`
      DELETE FROM ${this.sql(this.table)}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    return sub;
  }
}
