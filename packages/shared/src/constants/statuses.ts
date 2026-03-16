export const ACTIVITY_STATUSES = {
  SCHEDULED: "scheduled",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type ActivityStatus =
  (typeof ACTIVITY_STATUSES)[keyof typeof ACTIVITY_STATUSES];

export const AGENT_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type AgentStatus =
  (typeof AGENT_STATUSES)[keyof typeof AGENT_STATUSES];

export const RECURRING_ACTIVITY_STATUSES = {
  ACTIVE: "active",
  PAUSED: "paused",
  DELETED: "deleted",
} as const;

export type RecurringActivityStatus =
  (typeof RECURRING_ACTIVITY_STATUSES)[keyof typeof RECURRING_ACTIVITY_STATUSES];
