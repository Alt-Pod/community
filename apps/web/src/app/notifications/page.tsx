"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import AppNavbar from "@/components/app-navbar";
import NotificationList from "@/components/notification-list";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/requests/useNotifications";

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { data: notifications = [], isLoading } = useNotifications({
    unread: filter === "unread",
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-primary via-surface-secondary to-accent-gold-pale/30">
      <AppNavbar />
      <main className="py-10" style={{ minHeight: "calc(100vh - 53px)" }}>
        <div className="w-full max-w-2xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading text-2xl font-semibold text-text-primary">
              {t("title")}
            </h1>
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
            >
              {t("markAllRead")}
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === "all"
                  ? "bg-accent-gold-pale text-accent-gold font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
              }`}
            >
              {t("filters.all")}
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === "unread"
                  ? "bg-accent-gold-pale text-accent-gold font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
              }`}
            >
              {t("filters.unread")}
            </button>
          </div>

          <NotificationList
            notifications={notifications}
            loading={isLoading}
            emptyMessage={
              filter === "unread" ? t("emptyUnread") : t("empty")
            }
            onMarkRead={(id) => markRead.mutate(id)}
            onDelete={(id) => deleteNotification.mutate(id)}
          />
        </div>
      </main>
    </div>
  );
}
