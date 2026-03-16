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

export const NOTIFICATION_TYPE = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  MEETING: "meeting",
  AGENT: "agent",
  SCHEDULED: "scheduled",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const NOTIFICATION_TYPES: NotificationType[] =
  Object.values(NOTIFICATION_TYPE);

export interface ScheduledNotificationPayload {
  title: string;
  body: string;
  type?: string;
  link?: string | null;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
}
