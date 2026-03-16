CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  parent_job_id UUID REFERENCES jobs(id),
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB,
  error TEXT,
  current_step TEXT,
  progress JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  inngest_run_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type_status ON jobs(type, status);
CREATE INDEX IF NOT EXISTS idx_jobs_metadata ON jobs USING GIN(metadata);
