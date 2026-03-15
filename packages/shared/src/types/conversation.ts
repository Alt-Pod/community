export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export interface DbMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent_id: string | null;
  created_at: string;
}
