import { inngest, jobService, chatService, conversationService } from "@community/backend";
import { generateConversationTitle } from "../titleAgent";

export const titleGeneration = inngest.createFunction(
  { id: "title-generation", retries: 2 },
  { event: "job/started", if: "event.data.type == 'title.generate'" },
  async ({ event, step }) => {
    const { jobId, metadata } = event.data;
    const conversationId = metadata.conversationId as string;

    await step.run("mark-running", async () => {
      await jobService.markRunning(jobId);
    });

    const messages = await step.run("load-messages", async () => {
      const msgs = await chatService.getMessages(conversationId);
      return msgs.map((m) => ({
        role: String(m.role) as "user" | "assistant",
        content: String(m.content),
      }));
    });

    const title = await step.run("generate-title", async () => {
      return generateConversationTitle(messages);
    });

    await step.run("save-title", async () => {
      if (title) {
        await conversationService.updateTitle(conversationId, title);
      }
      await jobService.markCompleted(jobId, { title: title ?? null });
    });
  }
);
