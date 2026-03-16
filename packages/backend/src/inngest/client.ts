import { EventSchemas, Inngest } from "inngest";

type Events = {
  "job/started": {
    data: {
      jobId: string;
      type: string;
      input: Record<string, unknown>;
      metadata: Record<string, unknown>;
    };
  };
  "meeting/ready": {
    data: {
      activityId: string;
      jobId: string;
      userId: string;
    };
  };
  "meeting/started": {
    data: {
      activityId: string;
      jobId: string;
      conversationId: string;
      userId: string;
      agenda: string;
      participantAgentIds: string[];
      durationMinutes: number;
      endTime: number;
    };
  };
  "meeting/round-completed": {
    data: {
      activityId: string;
      jobId: string;
      conversationId: string;
      userId: string;
      roundNumber: number;
      agenda: string;
      participantAgentIds: string[];
      durationMinutes: number;
      endTime: number;
    };
  };
  "meeting/closing": {
    data: {
      activityId: string;
      jobId: string;
      conversationId: string;
      userId: string;
      agenda: string;
      participantAgentIds: string[];
      durationMinutes: number;
    };
  };
  "meeting/summarize": {
    data: {
      activityId: string;
      jobId: string;
      conversationId: string;
      userId: string;
      agenda: string;
      participantAgentIds: string[];
      durationMinutes: number;
    };
  };
  "notification/ready": {
    data: {
      activityId: string;
      jobId: string;
      userId: string;
    };
  };
};

export const inngest = new Inngest({
  id: "community",
  schemas: new EventSchemas().fromRecord<Events>(),
});

export type { Events };
