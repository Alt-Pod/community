export interface ActivityDefinition {
  id: string;
  name: string;
  description: string;
}

export const ACTIVITIES = {
  report_generation: {
    id: "report_generation",
    name: "Report Generation",
    description: "Generate and deliver a report on a given topic",
  },
  meeting: {
    id: "meeting",
    name: "Meeting",
    description: "A scheduled meeting between agents with an agenda",
  },
  scheduled_notification: {
    id: "scheduled_notification",
    name: "Scheduled Notification",
    description: "Send a notification at a scheduled time (reminder)",
  },
  task: {
    id: "task",
    name: "Task",
    description: "Solo agent task — one agent works with tools toward a goal",
  },
} as const satisfies Record<string, ActivityDefinition>;

export type ActivityType = keyof typeof ACTIVITIES;
