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
} as const satisfies Record<string, ActivityDefinition>;

export type ActivityType = keyof typeof ACTIVITIES;
