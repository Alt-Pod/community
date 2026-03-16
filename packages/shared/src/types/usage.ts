export interface UsageLog {
  id: string;
  user_id: string;
  conversation_id: string;
  agent_id: string | null;
  model: string;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

export interface UsageStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCost: number;
  dailyBreakdown: {
    date: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }[];
  agentBreakdown: {
    agentId: string | null;
    agentName: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }[];
}
