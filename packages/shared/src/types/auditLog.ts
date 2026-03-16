export interface AuditLog {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string;
  details: Record<string, unknown>;
  created_at: string;
}
