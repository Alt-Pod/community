import { generateText } from "ai";
import { getModel } from "../model";
import { LOGBOOK_AGENT_PROMPT } from "./logbookAgent";
import { sql } from "@community/backend";
import type { LogbookEvent } from "@community/shared";

interface RawRow {
  id: string;
  content?: string;
  title?: string;
  body?: string;
  filename?: string;
  category?: string;
  activity_type?: string;
  status?: string;
  output?: unknown;
  conversation_id?: string;
  conversation_title?: string;
  created_at?: string;
  completed_at?: string;
  [key: string]: unknown;
}

/**
 * Collect all notable events for a user since a given timestamp.
 * Queries messages, meetings, activities, notifications, and files.
 */
export async function collectEventsForUser(
  userId: string,
  since: Date
): Promise<{ events: LogbookEvent[]; summary: string }> {
  const sinceISO = since.toISOString();
  const events: LogbookEvent[] = [];
  const summaryParts: string[] = [];

  // 1. New messages (grouped by conversation)
  const messages = await sql<RawRow[]>`
    SELECT m.id, m.content, m.role, m.created_at, c.title as conversation_title, c.id as conversation_id
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE c.user_id = ${userId}
      AND m.created_at > ${sinceISO}
      AND c.type = 'chat'
    ORDER BY m.created_at ASC
    LIMIT 50
  `;

  if (messages.length > 0) {
    // Group by conversation
    const byConv = new Map<string, RawRow[]>();
    for (const msg of messages) {
      const key = msg.conversation_id as string;
      if (!byConv.has(key)) byConv.set(key, []);
      byConv.get(key)!.push(msg);
    }

    for (const [convId, msgs] of byConv) {
      const title = msgs[0].conversation_title || "Untitled conversation";
      const count = msgs.length;
      events.push({
        type: "message",
        id: convId,
        summary: `${count} new message(s) in "${title}"`,
        timestamp: msgs[0].created_at ?? sinceISO,
      });
      summaryParts.push(
        `- Conversation "${title}": ${count} new messages. Last message: "${(msgs[msgs.length - 1].content ?? "").slice(0, 200)}"`
      );
    }
  }

  // 2. Completed meetings
  const meetings = await sql<RawRow[]>`
    SELECT sa.id, sa.title, sa.output, sa.completed_at, sa.created_at
    FROM scheduled_activities sa
    WHERE sa.user_id = ${userId}
      AND sa.activity_type = 'meeting'
      AND sa.status = 'completed'
      AND sa.completed_at > ${sinceISO}
    ORDER BY sa.completed_at ASC
    LIMIT 20
  `;

  for (const meeting of meetings) {
    const output = meeting.output as { summary?: string } | null;
    const summary = output?.summary
      ? output.summary.slice(0, 300)
      : "No summary available";
    events.push({
      type: "meeting",
      id: meeting.id,
      summary: `Meeting "${meeting.title}" completed`,
      timestamp: meeting.completed_at ?? meeting.created_at ?? sinceISO,
    });
    summaryParts.push(
      `- Meeting "${meeting.title}" completed. Summary: ${summary}`
    );
  }

  // 3. Completed activities (non-meeting, non-notification)
  const activities = await sql<RawRow[]>`
    SELECT sa.id, sa.title, sa.activity_type, sa.status, sa.output, sa.completed_at, sa.created_at
    FROM scheduled_activities sa
    WHERE sa.user_id = ${userId}
      AND sa.activity_type NOT IN ('meeting', 'scheduled_notification')
      AND sa.status = 'completed'
      AND sa.completed_at > ${sinceISO}
    ORDER BY sa.completed_at ASC
    LIMIT 20
  `;

  for (const activity of activities) {
    events.push({
      type: "activity",
      id: activity.id,
      summary: `Activity "${activity.title}" (${activity.activity_type}) completed`,
      timestamp: activity.completed_at ?? activity.created_at ?? sinceISO,
    });
    summaryParts.push(
      `- Activity "${activity.title}" (${activity.activity_type}) completed`
    );
  }

  // 4. Notifications
  const notifications = await sql<RawRow[]>`
    SELECT id, title, body, type, created_at
    FROM notifications
    WHERE user_id = ${userId}
      AND created_at > ${sinceISO}
    ORDER BY created_at ASC
    LIMIT 30
  `;

  for (const notif of notifications) {
    events.push({
      type: "notification",
      id: notif.id,
      summary: `Notification: ${notif.title}`,
      timestamp: notif.created_at ?? sinceISO,
    });
    summaryParts.push(
      `- Notification "${notif.title}": ${(notif.body ?? "").slice(0, 150)}`
    );
  }

  // 5. Files uploaded
  const files = await sql<RawRow[]>`
    SELECT id, filename, category, created_at
    FROM files
    WHERE user_id = ${userId}
      AND created_at > ${sinceISO}
    ORDER BY created_at ASC
    LIMIT 20
  `;

  for (const file of files) {
    events.push({
      type: "file",
      id: file.id,
      summary: `File uploaded: ${file.filename} (${file.category})`,
      timestamp: file.created_at ?? sinceISO,
    });
    summaryParts.push(
      `- File uploaded: "${file.filename}" (category: ${file.category})`
    );
  }

  const summary =
    summaryParts.length > 0
      ? summaryParts.join("\n")
      : "No new events.";

  return { events, summary };
}

/**
 * Generate or update a logbook entry using AI.
 */
export async function generateLogbookEntry(
  existingContent: string | null,
  eventsSummary: string
): Promise<string> {
  const userMessage = existingContent
    ? `Here is the current logbook entry for today:\n\n${existingContent}\n\n---\n\nNew events to integrate:\n\n${eventsSummary}\n\nPlease update the logbook entry by integrating these new events chronologically.`
    : `Here are today's events:\n\n${eventsSummary}\n\nPlease write today's logbook entry.`;

  const { text } = await generateText({
    model: getModel(),
    system: LOGBOOK_AGENT_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  return text;
}
