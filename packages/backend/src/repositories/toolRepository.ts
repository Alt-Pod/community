import type { Sql } from "postgres";

export class ToolRepository {
  constructor(private sql: Sql) {}

  async findByAgentId(agentId: string): Promise<string[]> {
    const rows = await this.sql<{ tool_id: string }[]>`
      SELECT tool_id FROM agent_tools WHERE agent_id = ${agentId}
    `;
    return rows.map((r) => r.tool_id);
  }

  async assignToAgent(agentId: string, toolIds: string[]): Promise<void> {
    if (toolIds.length === 0) return;
    const values = toolIds.map((toolId) => ({ agent_id: agentId, tool_id: toolId }));
    await this.sql`
      INSERT INTO agent_tools ${this.sql(values, "agent_id", "tool_id")}
      ON CONFLICT DO NOTHING
    `;
  }

  async removeFromAgent(agentId: string, toolIds: string[]): Promise<void> {
    if (toolIds.length === 0) return;
    await this.sql`
      DELETE FROM agent_tools
      WHERE agent_id = ${agentId} AND tool_id = ANY(${toolIds})
    `;
  }

  async findAllAssignments(): Promise<
    { tool_id: string; agent_id: string; agent_name: string }[]
  > {
    const rows = await this.sql<
      { tool_id: string; agent_id: string; agent_name: string }[]
    >`
      SELECT at.tool_id, at.agent_id, a.name AS agent_name
      FROM agent_tools at
      JOIN agents a ON a.id = at.agent_id
      ORDER BY at.tool_id, a.name
    `;
    return rows;
  }

  async setAgentTools(agentId: string, toolIds: string[]): Promise<void> {
    await this.sql`DELETE FROM agent_tools WHERE agent_id = ${agentId}`;
    if (toolIds.length > 0) {
      const values = toolIds.map((toolId) => ({ agent_id: agentId, tool_id: toolId }));
      await this.sql`
        INSERT INTO agent_tools ${this.sql(values, "agent_id", "tool_id")}
      `;
    }
  }
}
