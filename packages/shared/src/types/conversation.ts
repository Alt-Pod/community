import type { ConversationType } from "../constants/conversation";
import type { MessageRole } from "../constants/conversation";

export interface Conversation {
  id: string;
  title: string;
  agent_id: string | null;
  title_generated: boolean;
  type: ConversationType;
  ended_at: string | null;
  created_at: string;
}

export interface DbMessage {
  id: string;
  role: MessageRole;
  content: string;
  parts: unknown[] | null;
  agent_id: string | null;
  created_at: string;
}
