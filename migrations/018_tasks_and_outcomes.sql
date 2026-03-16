-- Add user_id to agents (agents now belong to a user)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- Outcome column for activity results (3-outcome model)
ALTER TABLE scheduled_activities ADD COLUMN IF NOT EXISTS outcome JSONB;
