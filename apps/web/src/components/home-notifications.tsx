"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useNotifications, useMarkAllNotificationsRead } from "@/requests/useNotifications";
import NotificationList from "./notification-list";

export default function HomeNotifications() {
  const t = useTranslations("home");
  const { data: notifications = [], isLoading } = useNotifications({
    unread: true,
    limit: 5,
  });
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    if (!isLoading && notifications.length > 0) {
      markAllRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

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
      />
    </div>
  );
}
