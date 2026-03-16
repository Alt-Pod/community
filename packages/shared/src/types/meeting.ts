export interface MeetingPayload {
  participant_agent_ids: string[];
  agenda: string;
  duration_minutes: number;
  timezone: string;
  conversation_id?: string;
  summary?: string;
  summary_title?: string;
}
