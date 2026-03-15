export interface Agent {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentResponse {
  content: string;
  agent_id: string;
  agent_name: string;
}
