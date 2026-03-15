import type { DbMessage } from "@community/shared";

export async function fetchMessages(conversationId: string): Promise<DbMessage[]> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}
