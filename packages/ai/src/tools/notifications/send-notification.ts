import { tool, zodSchema } from "ai";
import { z } from "zod";
import { notificationService } from "@community/backend";
import type { CommunityToolDefinition } from "../types";

export const sendNotificationTool: CommunityToolDefinition = {
  meta: {
    id: "notifications.send_notification",
    category: "notifications",
    displayName: "tools.notifications.sendNotification.name",
    description: "Send a notification to the user",
    requiresConfirmation: false,
  },
  toolFactory: (ctx) =>
    tool({
      description:
        "Send a notification to the user. Use this when you want to alert the user about something important, like a completed task, a meeting ending, a reminder, or any significant event.",
      inputSchema: zodSchema(
        z.object({
          title: z
            .string()
            .describe("Short notification title (max ~80 chars)"),
          body: z.string().describe("Notification body with details"),
          type: z
            .enum(["info", "success", "warning", "meeting", "agent"])
            .default("info")
            .describe("Notification type for visual styling"),
          link: z
            .string()
            .optional()
            .describe(
              "Optional URL path to navigate to when clicked (e.g. /meetings/abc123)"
            ),
          conversation_id: z
            .string()
            .optional()
            .describe("Optional related conversation ID"),
        })
      ),
      execute: async ({ title, body, type, link, conversation_id }) => {
        const notification = await notificationService.create(ctx.userId, {
          title,
          body,
          type: type ?? "info",
          link,
          agentId: ctx.agentId ?? null,
          conversationId: conversation_id ?? null,
        });
        return { success: true, notification_id: notification.id };
      },
    }),
};
