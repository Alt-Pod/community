-- Logbook entries: one per user per day, enriched progressively by a background job
CREATE TABLE IF NOT EXISTS logbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  events_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INT NOT NULL DEFAULT 1,
  last_enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_logbook_entries_user_id ON logbook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_user_date ON logbook_entries(user_id, entry_date DESC);
