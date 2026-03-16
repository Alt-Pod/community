import type { Notification } from "@community/shared";

export async function fetchNotifications(params?: {
  unread?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Notification[]> {
  const searchParams = new URLSearchParams();
  if (params?.unread) searchParams.set("unread", "true");
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  const res = await fetch(`/api/notifications${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function fetchUnreadCount(): Promise<{ count: number }> {
  const res = await fetch("/api/notifications/unread-count");
  if (!res.ok) throw new Error("Failed to fetch unread count");
  return res.json();
}

export async function markAllNotificationsRead(): Promise<{ count: number }> {
  const res = await fetch("/api/notifications/read-all", { method: "POST" });
  if (!res.ok) throw new Error("Failed to mark all as read");
  return res.json();
}
