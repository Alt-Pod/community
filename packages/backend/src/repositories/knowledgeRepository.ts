import type { Sql } from "postgres";
import type { KnowledgeEntry } from "@community/shared";

export class KnowledgeRepository {
  constructor(
    private sql: Sql,
    private table: string = "knowledge_entries"
  ) {}

  async findByUserId(userId: string): Promise<KnowledgeEntry[]> {
    return this.sql<KnowledgeEntry[]>`
      SELECT id, user_id, agent_id, category, content, source, created_at, updated_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  async findByUserIdAndCategory(
    userId: string,
    category: string
  ): Promise<KnowledgeEntry[]> {
    return this.sql<KnowledgeEntry[]>`
      SELECT id, user_id, agent_id, category, content, source, created_at, updated_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId} AND category = ${category}
      ORDER BY created_at DESC
    `;
  }

  async findByAgentId(
    userId: string,
    agentId: string
  ): Promise<KnowledgeEntry[]> {
    return this.sql<KnowledgeEntry[]>`
      SELECT id, user_id, agent_id, category, content, source, created_at, updated_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId} AND agent_id = ${agentId}
      ORDER BY created_at DESC
    `;
  }

  async create(data: {
    userId: string;
    agentId?: string | null;
    category: string;
    content: string;
    source?: string | null;
  }): Promise<KnowledgeEntry> {
    const [entry] = await this.sql<KnowledgeEntry[]>`
      INSERT INTO ${this.sql(this.table)} (user_id, agent_id, category, content, source)
      VALUES (${data.userId}, ${data.agentId ?? null}, ${data.category}, ${data.content}, ${data.source ?? null})
      RETURNING *
    `;
    return entry;
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const [entry] = await this.sql<KnowledgeEntry[]>`
      DELETE FROM ${this.sql(this.table)}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    return !!entry;
  }
}
