-- Add conversation type to distinguish meetings from regular chats
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'chat';

-- Add ended_at for tracking meeting duration
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations (type);
