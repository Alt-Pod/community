"use client";

import Link from "next/link";
import { useUnreadNotificationCount } from "@/requests/useNotifications";

export default function NotificationBadge() {
  const { data } = useUnreadNotificationCount();
  const count = data?.count ?? 0;

  return (
    <Link
      href="/notifications"
      className="relative flex items-center justify-center w-8 h-8 rounded-sm hover:bg-surface-tertiary transition-colors duration-150"
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[18px] h-[18px] text-text-secondary"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
