export interface Conversation {
  id: string;
  title: string;
  agent_id: string | null;
  title_generated: boolean;
  type: "chat" | "meeting";
  ended_at: string | null;
  created_at: string;
}

export interface DbMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts: unknown[] | null;
  agent_id: string | null;
  created_at: string;
}
