export interface TaskPayload {
  agent_id: string;
  goal: string;
  max_iterations: number;
  conversation_id?: string;
  summary?: string;
  summary_title?: string;
}
