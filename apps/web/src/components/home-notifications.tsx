"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useNotifications, useMarkNotificationRead, useDeleteNotification } from "@/requests/useNotifications";
import NotificationList from "./notification-list";

export default function HomeNotifications() {
  const t = useTranslations("home");
  const { data: notifications = [], isLoading } = useNotifications({
    unread: true,
    limit: 5,
  });
  const markRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-base font-semibold text-text-primary">
          {t("notifications.title")}
        </h3>
        <Link
          href="/notifications"
          className="text-xs text-text-tertiary hover:text-text-primary"
        >
          {t("notifications.viewAll")}
        </Link>
      </div>
      <NotificationList
        notifications={notifications}
        loading={isLoading}
        emptyMessage={t("notifications.empty")}
        onMarkRead={(id) => markRead.mutate(id)}
        onDelete={(id) => deleteNotification.mutate(id)}
      />
    </div>
  );
}
