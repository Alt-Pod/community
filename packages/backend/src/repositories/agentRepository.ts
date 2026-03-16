import type { Sql } from "postgres";
import type { Agent, AgentStatus } from "@community/shared";
import { AGENT_STATUSES } from "@community/shared";

export class AgentRepository {
  constructor(
    private sql: Sql,
    private table: string = "agents"
  ) {}

  async findAll(): Promise<Agent[]> {
    return this.sql<Agent[]>`
      SELECT id, user_id, name, description, system_prompt, status, created_at, updated_at
      FROM ${this.sql(this.table)}
      WHERE status = ${AGENT_STATUSES.ACTIVE}
      ORDER BY created_at ASC
    `;
  }

  async findById(id: string): Promise<Agent | null> {
    const [agent] = await this.sql<Agent[]>`
      SELECT id, user_id, name, description, system_prompt, status, created_at, updated_at
      FROM ${this.sql(this.table)}
      WHERE id = ${id}
    `;
    return agent ?? null;
  }

  async findByUserId(userId: string): Promise<Agent[]> {
    return this.sql<Agent[]>`
      SELECT id, user_id, name, description, system_prompt, status, created_at, updated_at
      FROM ${this.sql(this.table)}
      WHERE user_id = ${userId} AND status = ${AGENT_STATUSES.ACTIVE}
      ORDER BY created_at ASC
    `;
  }

  async findDistinctUserIds(): Promise<string[]> {
    const rows = await this.sql<{ user_id: string }[]>`
      SELECT DISTINCT user_id
      FROM ${this.sql(this.table)}
      WHERE status = ${AGENT_STATUSES.ACTIVE} AND user_id IS NOT NULL
    `;
    return rows.map((r) => r.user_id);
  }

  async create(data: {
    name: string;
    description?: string | null;
    system_prompt: string;
    user_id?: string | null;
  }): Promise<Agent> {
    const [agent] = await this.sql<Agent[]>`
      INSERT INTO ${this.sql(this.table)} (name, description, system_prompt, user_id)
      VALUES (${data.name}, ${data.description ?? null}, ${data.system_prompt}, ${data.user_id ?? null})
      RETURNING *
    `;
    return agent;
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      system_prompt?: string;
      status?: AgentStatus;
    }
  ): Promise<Agent | null> {
    const sets: string[] = [];
    const values: Record<string, unknown> = {};

    if (data.name !== undefined) {
      values.name = data.name;
    }
    if (data.description !== undefined) {
      values.description = data.description;
    }
    if (data.system_prompt !== undefined) {
      values.system_prompt = data.system_prompt;
    }
    if (data.status !== undefined) {
      values.status = data.status;
    }

    if (Object.keys(values).length === 0) {
      return this.findById(id);
    }

    const [agent] = await this.sql<Agent[]>`
      UPDATE ${this.sql(this.table)}
      SET ${this.sql(values)}, updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return agent ?? null;
  }

  async deleteById(id: string): Promise<Agent | null> {
    const [agent] = await this.sql<Agent[]>`
      DELETE FROM ${this.sql(this.table)}
      WHERE id = ${id}
      RETURNING *
    `;
    return agent ?? null;
  }
}
