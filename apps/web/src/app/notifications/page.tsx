"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import AppNavbar from "@/components/app-navbar";
import NotificationList from "@/components/notification-list";
import {
  useNotifications,
  useMarkAllNotificationsRead,
} from "@/requests/useNotifications";

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const { data: notifications = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    if (!isLoading && notifications.length > 0) {
      markAllRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-primary via-surface-secondary to-accent-gold-pale/30">
      <AppNavbar />
      <main className="py-10" style={{ minHeight: "calc(100vh - 53px)" }}>
        <div className="w-full max-w-2xl mx-auto px-4 md:px-6">
          <h1 className="font-heading text-2xl font-semibold text-text-primary mb-6">
            {t("title")}
          </h1>

          <NotificationList
            notifications={notifications}
            loading={isLoading}
            emptyMessage={t("empty")}
          />
        </div>
      </main>
    </div>
  );
}
