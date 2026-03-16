export interface KnowledgeEntry {
  id: string;
  user_id: string;
  agent_id: string | null;
  category: string;
  content: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}
