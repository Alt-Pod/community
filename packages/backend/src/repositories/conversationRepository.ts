import type { Sql } from "postgres";

export class ConversationRepository {
  constructor(
    private sql: Sql,
    private table: string = "conversations"
  ) {}

  async findByUserId(userId: string) {
    return this.sql`
      SELECT id, title, agent_id, title_generated, created_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  async findById(id: string, userId: string) {
    const [conversation] = await this.sql`
      SELECT id, title, agent_id, title_generated, created_at
      FROM ${this.sql(this.table)}
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return conversation ?? null;
  }

  async updateTitle(id: string, title: string) {
    const [conversation] = await this.sql`
      UPDATE ${this.sql(this.table)}
      SET title = ${title}, title_generated = TRUE
      WHERE id = ${id}
      RETURNING id, title, agent_id, title_generated, created_at
    `;
    return conversation ?? null;
  }

  async create(userId: string, title: string, agentId?: string | null) {
    const [conversation] = await this.sql`
      INSERT INTO ${this.sql(this.table)} (user_id, title, agent_id)
      VALUES (${userId}, ${title}, ${agentId ?? null})
      RETURNING *
    `;
    return conversation;
  }

  async deleteById(id: string, userId: string) {
    const [conversation] = await this.sql`
      DELETE FROM ${this.sql(this.table)}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    return conversation ?? null;
  }
}
