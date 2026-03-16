export type RecurrenceFrequency = "daily" | "weekly" | "monthly";
export type RecurringActivityStatus = "active" | "paused" | "deleted";

export interface RecurringActivity {
  id: string;
  user_id: string;
  agent_id: string | null;
  activity_type: string;
  title: string;
  description: string | null;
  payload: Record<string, unknown>;
  frequency: RecurrenceFrequency;
  interval_value: number;
  days_of_week: number[] | null;
  day_of_month: number | null;
  time_of_day: string;
  timezone: string;
  end_after_occurrences: number | null;
  end_by_date: string | null;
  status: RecurringActivityStatus;
  occurrences_created: number;
  start_date: string;
  last_materialized_at: string | null;
  created_at: string;
  updated_at: string;
}
