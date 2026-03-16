import { EventSchemas, Inngest } from "inngest";
import { INNGEST_EVENTS } from "@community/shared";

type Events = {
  [INNGEST_EVENTS.JOB_STARTED]: {
    data: {
      jobId: string;
      type: string;
      input: Record<string, unknown>;
      metadata: Record<string, unknown>;
    };
  };
  [INNGEST_EVENTS.MEETING_READY]: {
    data: {
      activityId: string;
      jobId: string;
      userId: string;
    };
  };
  [INNGEST_EVENTS.MEETING_STARTED]: {
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
  [INNGEST_EVENTS.MEETING_ROUND_COMPLETED]: {
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
  [INNGEST_EVENTS.MEETING_CLOSING]: {
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
  [INNGEST_EVENTS.MEETING_SUMMARIZE]: {
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
  [INNGEST_EVENTS.NOTIFICATION_READY]: {
    data: {
      activityId: string;
      jobId: string;
      userId: string;
    };
  };
  [INNGEST_EVENTS.TASK_READY]: {
    data: {
      activityId: string;
      jobId: string;
      userId: string;
    };
  };
  [INNGEST_EVENTS.TASK_COMPLETED]: {
    data: {
      activityId: string;
      jobId: string;
      conversationId: string;
      userId: string;
      goal: string;
      agentId: string;
    };
  };
};

export const inngest = new Inngest({
  id: "community",
  schemas: new EventSchemas().fromRecord<Events>(),
});

export type { Events };
