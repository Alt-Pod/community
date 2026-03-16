export const CONVERSATION_TYPES = {
  CHAT: "chat",
  MEETING: "meeting",
  TASK: "task",
} as const;

export type ConversationType =
  (typeof CONVERSATION_TYPES)[keyof typeof CONVERSATION_TYPES];

export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;

export type MessageRole =
  (typeof MESSAGE_ROLES)[keyof typeof MESSAGE_ROLES];
