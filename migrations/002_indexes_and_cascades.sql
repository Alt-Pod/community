-- Indexes on foreign key columns
CREATE INDEX IF NOT EXISTS idx_agents_department_id ON agents(department_id);
CREATE INDEX IF NOT EXISTS idx_agents_reports_to ON agents(reports_to);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);

-- Add ON DELETE CASCADE to conversations.user_id
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add ON DELETE CASCADE to messages.conversation_id
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
