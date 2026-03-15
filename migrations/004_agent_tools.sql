-- Agent-to-tool mapping. Tool definitions live in code (packages/ai registry).
-- This table only stores which tools each agent is allowed to use.
CREATE TABLE IF NOT EXISTS agent_tools (
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  PRIMARY KEY (agent_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_tools_agent_id ON agent_tools(agent_id);
