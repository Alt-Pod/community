-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  purpose TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  reports_to UUID REFERENCES agents(id),
  triggers TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'retired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Processes
CREATE TABLE IF NOT EXISTS processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  trigger TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  agent_id UUID REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data is now managed by scripts/seed.js (run via yarn db:seed or yarn db:reset)
