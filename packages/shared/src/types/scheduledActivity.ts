export interface ScheduledActivity {
  id: string;
  user_id: string;
  agent_id: string | null;
  activity_type: string;
  title: string;
  description: string | null;
  payload: Record<string, unknown>;
  scheduled_at: string;
  status: "scheduled" | "running" | "completed" | "failed" | "cancelled";
  output: Record<string, unknown> | null;
  error: string | null;
  job_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}
