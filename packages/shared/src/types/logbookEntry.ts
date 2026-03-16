import type { LogbookEventType } from "../constants/logbook";

export interface LogbookEvent {
  type: LogbookEventType;
  id: string;
  summary: string;
  timestamp: string;
}

export interface LogbookEntry {
  id: string;
  user_id: string;
  entry_date: string;
  content: string;
  events_summary: LogbookEvent[];
  version: number;
  last_enriched_at: string | null;
  created_at: string;
  updated_at: string;
}
