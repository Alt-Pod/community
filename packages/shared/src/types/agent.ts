import type { AgentStatus } from "../constants/statuses";
import type { MessageRole } from "../constants/conversation";

export interface Agent {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  system_prompt: string;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
}

export interface AgentMessage {
  role: MessageRole;
  content: string;
}

export interface AgentResponse {
  content: string;
  agent_id: string;
  agent_name: string;
}
