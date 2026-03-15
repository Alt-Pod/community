export interface Agent {
  id: string;
  name: string;
  department_id: string;
  purpose: string;
  responsibilities: string[];
  reports_to: string | null;
  triggers: string[];
  status: "active" | "paused" | "retired";
  created_at: Date;
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
