export const INNGEST_FUNCTION_IDS = {
  ACTIVITY_CRON: "activity-cron",
  MEETING_START: "meeting-start",
  MEETING_ROUND: "meeting-round",
  MEETING_CLOSING: "meeting-closing",
  MEETING_SUMMARY: "meeting-summary",
  TASK_EXECUTION: "task-execution",
  NOTIFICATION_EXECUTION: "notification-execution",

  TITLE_GENERATION: "title-generation",
  LOGBOOK_CRON: "logbook-cron",
  RECURRENCE_MATERIALIZER: "recurrence-materializer",
  ACTIVITY_EXECUTION: "activity-execution",
} as const;

export type InngestFunctionId =
  (typeof INNGEST_FUNCTION_IDS)[keyof typeof INNGEST_FUNCTION_IDS];

export const INNGEST_EVENTS = {
  MEETING_READY: "meeting/ready",
  MEETING_STARTED: "meeting/started",
  MEETING_ROUND_COMPLETED: "meeting/round-completed",
  MEETING_CLOSING: "meeting/closing",
  MEETING_SUMMARIZE: "meeting/summarize",
  TASK_READY: "task/ready",
  TASK_COMPLETED: "task/completed",
  NOTIFICATION_READY: "notification/ready",
  JOB_STARTED: "job/started",
} as const;

export type InngestEventName =
  (typeof INNGEST_EVENTS)[keyof typeof INNGEST_EVENTS];
