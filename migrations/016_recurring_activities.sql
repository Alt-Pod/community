-- Recurring activities: recurrence rules that materialize into scheduled_activities
CREATE TABLE IF NOT EXISTS recurring_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  -- Recurrence rule
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  interval_value INT NOT NULL DEFAULT 1 CHECK (interval_value >= 1),
  days_of_week INT[] DEFAULT NULL,       -- 0=Sun..6=Sat (weekly)
  day_of_month INT DEFAULT NULL,          -- 1-31 (monthly)
  time_of_day TIME NOT NULL,              -- HH:MM:SS local time
  timezone TEXT NOT NULL DEFAULT 'UTC',
  -- End conditions
  end_after_occurrences INT DEFAULT NULL,
  end_by_date DATE DEFAULT NULL,
  -- State
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
  occurrences_created INT NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  last_materialized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurring_activities_user_id ON recurring_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_activities_status ON recurring_activities(status);

-- Link materialized instances back to their parent recurring activity
ALTER TABLE scheduled_activities ADD COLUMN IF NOT EXISTS recurring_activity_id UUID REFERENCES recurring_activities(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_scheduled_activities_recurring ON scheduled_activities(recurring_activity_id);
