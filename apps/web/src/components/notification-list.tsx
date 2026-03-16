"use client";

import type { Notification } from "@community/shared";
import NotificationItem from "./notification-item";

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function NotificationList({
  notifications,
  loading,
  emptyMessage = "No notifications yet.",
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-lg border border-border-subtle bg-surface-secondary animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <p className="text-sm text-text-tertiary text-center py-4">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
}
