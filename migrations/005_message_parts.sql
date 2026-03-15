-- Add parts column for structured message content (tool calls, results, etc.)
-- Falls back to content TEXT for backward compatibility.
ALTER TABLE messages ADD COLUMN IF NOT EXISTS parts JSONB;
