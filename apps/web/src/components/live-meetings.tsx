"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@community/ui";
import type { ScheduledActivity } from "@community/shared";

interface LiveMeeting extends ScheduledActivity {
  participants: { id: string; name: string }[];
  conversation_id: string | null;
}

async function fetchLiveMeetings(): Promise<LiveMeeting[]> {
  const res = await fetch("/api/meetings/live");
  if (!res.ok) throw new Error("Failed to fetch live meetings");
  return res.json();
}

function statusVariant(
  status: string
): "pending" | "running" | "success" | "error" {
  switch (status) {
    case "scheduled":
      return "pending";
    case "running":
      return "running";
    case "completed":
      return "success";
    case "failed":
      return "error";
    default:
      return "pending";
  }
}

function relativeTime(scheduledAt: string): string {
  const now = Date.now();
  const target = new Date(scheduledAt).getTime();
  const diff = target - now;
  const absDiff = Math.abs(diff);
  const minutes = Math.round(absDiff / 60000);

  if (minutes < 1) return "now";
  if (diff > 0) return `in ${minutes}m`;
  return `${minutes}m ago`;
}

export default function LiveMeetings() {
  const t = useTranslations("home");
  const { data: meetings = [] } = useQuery({
    queryKey: ["live-meetings"],
    queryFn: fetchLiveMeetings,
    refetchInterval: 10_000, // poll every 10s
  });

  if (meetings.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading text-base font-semibold text-text-primary">
            {t("liveMeetings.title")}
          </h3>
          <Link
            href="/meetings"
            className="text-xs text-text-tertiary hover:text-text-primary"
          >
            {t("liveMeetings.viewAll")}
          </Link>
        </div>
        <p className="text-sm text-text-tertiary text-center py-4">
          {t("liveMeetings.noMeetings")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-base font-semibold text-text-primary">
          {t("liveMeetings.title")}
        </h3>
        <Link
          href="/meetings"
          className="text-xs text-text-tertiary hover:text-text-primary"
        >
          {t("liveMeetings.viewAll")}
        </Link>
      </div>
      <div className="space-y-2">
        {meetings.map((meeting) => (
          <Link
            key={meeting.id}
            href={`/meetings/${meeting.id}`}
            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border-subtle hover:border-accent-gold-muted transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {meeting.status === "running" && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                )}
                <span className="text-sm font-medium text-text-primary truncate">
                  {meeting.title}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-tertiary">
                  {relativeTime(meeting.scheduled_at)}
                </span>
                {meeting.participants.length > 0 && (
                  <span className="text-xs text-text-tertiary truncate">
                    {meeting.participants.map((p) => p.name).join(", ")}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge
              variant={statusVariant(meeting.status)}
              label={meeting.status === "running" ? t("liveMeetings.live") : meeting.status}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
