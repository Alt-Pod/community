import type { Sql } from "postgres";
import type { ConversationType } from "@community/shared";
import { CONVERSATION_TYPES } from "@community/shared";

export class ConversationRepository {
  constructor(
    private sql: Sql,
    private table: string = "conversations"
  ) {}

  async findByUserId(userId: string) {
    return this.sql`
      SELECT id, title, agent_id, title_generated, type, ended_at, created_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId} AND type = ${CONVERSATION_TYPES.CHAT}
      ORDER BY created_at DESC
    `;
  }

  async findMeetingsByUserId(userId: string) {
    return this.sql`
      SELECT id, title, agent_id, title_generated, type, ended_at, created_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId} AND type = ${CONVERSATION_TYPES.MEETING}
      ORDER BY created_at DESC
    `;
  }

  async findById(id: string, userId: string) {
    const [conversation] = await this.sql`
      SELECT id, title, agent_id, title_generated, type, ended_at, created_at
      FROM ${this.sql(this.table)}
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return conversation ?? null;
  }

  async findByIdInternal(id: string) {
    const [conversation] = await this.sql`
      SELECT id, title, agent_id, title_generated, type, ended_at, created_at
      FROM ${this.sql(this.table)}
      WHERE id = ${id}
    `;
    return conversation ?? null;
  }

  async updateTitle(id: string, title: string) {
    const [conversation] = await this.sql`
      UPDATE ${this.sql(this.table)}
      SET title = ${title}, title_generated = TRUE
      WHERE id = ${id}
      RETURNING id, title, agent_id, title_generated, type, ended_at, created_at
    `;
    return conversation ?? null;
  }

  async findTasksByUserId(userId: string) {
    return this.sql`
      SELECT id, title, agent_id, title_generated, type, ended_at, created_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId} AND type = ${CONVERSATION_TYPES.TASK}
      ORDER BY created_at DESC
    `;
  }

  async create(
    userId: string,
    title: string,
    agentId?: string | null,
    type: ConversationType = CONVERSATION_TYPES.CHAT
  ) {
    const [conversation] = await this.sql`
      INSERT INTO ${this.sql(this.table)} (user_id, title, agent_id, type)
      VALUES (${userId}, ${title}, ${agentId ?? null}, ${type})
      RETURNING *
    `;
    return conversation;
  }

  async updateEndedAt(id: string, endedAt: Date) {
    await this.sql`
      UPDATE ${this.sql(this.table)}
      SET ended_at = ${endedAt.toISOString()}
      WHERE id = ${id}
    `;
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
