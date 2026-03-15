import type { Sql } from "postgres";

export class MessageRepository {
  constructor(
    private sql: Sql,
    private table: string = "messages"
  ) {}

  async findByConversationId(conversationId: string) {
    return this.sql`
      SELECT id, role, content, agent_id, created_at
      FROM ${this.sql(this.table)}
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;
  }

  async create(data: {
    conversationId: string;
    role: string;
    content: string;
    agentId?: string | null;
  }) {
    const [message] = await this.sql`
      INSERT INTO ${this.sql(this.table)} (conversation_id, role, content, agent_id)
      VALUES (${data.conversationId}, ${data.role}, ${data.content}, ${data.agentId ?? null})
      RETURNING *
    `;
    return message;
  }

  async deleteByConversationId(conversationId: string) {
    await this.sql`
      DELETE FROM ${this.sql(this.table)}
      WHERE conversation_id = ${conversationId}
    `;
  }
}
