ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
