-- Step 1: Drop foreign keys on agents that reference removed columns
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_department_id_fkey;
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_reports_to_fkey;

-- Step 2: Drop indexes on removed columns
DROP INDEX IF EXISTS idx_agents_department_id;
DROP INDEX IF EXISTS idx_agents_reports_to;

-- Step 3: Drop unused columns from agents
ALTER TABLE agents
  DROP COLUMN IF EXISTS department_id,
  DROP COLUMN IF EXISTS purpose,
  DROP COLUMN IF EXISTS responsibilities,
  DROP COLUMN IF EXISTS reports_to,
  DROP COLUMN IF EXISTS triggers;

-- Step 4: Add new columns to agents
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS system_prompt TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Step 5: Update existing agent (Chief of Staff) if it exists
-- Wrapped in IF EXISTS because seed data may not include this agent
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM agents WHERE id = '00000000-0000-0000-0000-000000000010') THEN
    UPDATE agents
    SET
      description = 'Your main point of contact. Knows about all available agents and helps you navigate the organization.',
      system_prompt = 'You are the Chief of Staff, the primary point of contact in the user''s personal AI organization called Community.

Your role is to help the user understand what Community can do and which agents are available to assist them.

## Rules
- Be concise and actionable. Lead with the recommendation.
- When the user asks about agents, use the available tools to list, create, update, or delete them.
- If the user wants to talk to a specific agent, explain that they can start a new conversation and select that agent from the picker.
- Be warm and helpful. You are the front door to the organization.',
      updated_at = now()
    WHERE id = '00000000-0000-0000-0000-000000000010';
  END IF;
END $$;

-- Step 6: Make system_prompt NOT NULL (after populating existing rows)
ALTER TABLE agents ALTER COLUMN system_prompt SET NOT NULL;

-- Step 7: Update status constraint
ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_status_check;
ALTER TABLE agents ADD CONSTRAINT agents_status_check CHECK (status IN ('active', 'inactive'));

-- Update existing status values
UPDATE agents SET status = 'inactive' WHERE status IN ('paused', 'retired');

-- Step 8: Add agent_id to conversations (nullable = default mode)
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id);

-- Step 9: Drop unused tables
DROP TABLE IF EXISTS processes;
DROP TABLE IF EXISTS departments;
