export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  agent_id: string | null;
  conversation_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "meeting"
  | "agent";

export const NOTIFICATION_TYPES: NotificationType[] = [
  "info",
  "success",
  "warning",
  "meeting",
  "agent",
];

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}
