-- Scheduled activities: instances of hardcoded activity types, linked to Inngest jobs
CREATE TABLE IF NOT EXISTS scheduled_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'running', 'completed', 'failed', 'cancelled')),
  output JSONB,
  error TEXT,
  job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scheduled_activities_user_id ON scheduled_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_agent_id ON scheduled_activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_scheduled_at ON scheduled_activities(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_status ON scheduled_activities(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_user_scheduled ON scheduled_activities(user_id, scheduled_at);
