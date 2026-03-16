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
};

export const inngest = new Inngest({
  id: "community",
  schemas: new EventSchemas().fromRecord<Events>(),
});

export type { Events };
