import type { Sql } from "postgres";

export class UsageRepository {
  constructor(
    private sql: Sql,
    private table: string = "usage_logs"
  ) {}

  async create(data: {
    userId: string;
    conversationId: string;
    agentId?: string | null;
    model: string;
    inputTokens: number;
    outputTokens: number;
  }) {
    const [log] = await this.sql`
      INSERT INTO ${this.sql(this.table)} (user_id, conversation_id, agent_id, model, input_tokens, output_tokens)
      VALUES (${data.userId}, ${data.conversationId}, ${data.agentId ?? null}, ${data.model}, ${data.inputTokens}, ${data.outputTokens})
      RETURNING *
    `;
    return log;
  }

  async getStats(from: Date, to: Date) {
    const totals = await this.sql`
      SELECT COALESCE(SUM(input_tokens), 0)::int AS total_input_tokens,
             COALESCE(SUM(output_tokens), 0)::int AS total_output_tokens
      FROM ${this.sql(this.table)}
      WHERE created_at >= ${from}
        AND created_at < ${to}
    `;

    const daily = await this.sql`
      SELECT DATE(created_at) AS date,
             COALESCE(SUM(input_tokens), 0)::int AS input_tokens,
             COALESCE(SUM(output_tokens), 0)::int AS output_tokens
      FROM ${this.sql(this.table)}
      WHERE created_at >= ${from}
        AND created_at < ${to}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `;

    const byAgent = await this.sql`
      SELECT u.agent_id,
             a.name AS agent_name,
             COALESCE(SUM(u.input_tokens), 0)::int AS input_tokens,
             COALESCE(SUM(u.output_tokens), 0)::int AS output_tokens
      FROM ${this.sql(this.table)} u
      LEFT JOIN agents a ON a.id = u.agent_id
      WHERE u.created_at >= ${from}
        AND u.created_at < ${to}
      GROUP BY u.agent_id, a.name
      ORDER BY SUM(u.input_tokens + u.output_tokens) DESC
    `;

    return { totals: totals[0], daily, byAgent };
  }
}
