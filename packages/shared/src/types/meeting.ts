export interface MeetingPayload {
  participant_agent_ids: string[];
  agenda: string;
  duration_minutes: number;
  timezone: string;
  include_assistant?: boolean;
  conversation_id?: string;
  summary?: string;
  summary_title?: string;
}
