export const LOGBOOK_EVENT_TYPES = {
  MESSAGE: "message",
  MEETING: "meeting",
  ACTIVITY: "activity",
  NOTIFICATION: "notification",
  FILE: "file",
} as const;

export type LogbookEventType =
  (typeof LOGBOOK_EVENT_TYPES)[keyof typeof LOGBOOK_EVENT_TYPES];
