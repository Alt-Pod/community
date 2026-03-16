"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@community/ui";
import type { ScheduledActivity, MeetingPayload } from "@community/shared";

interface PlanningDailyTileProps {
  activity: ScheduledActivity;
  agentNames: Record<string, string>;
  hourHeight: number;
  startHour?: number;
}

function statusVariant(
  status: ScheduledActivity["status"]
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
    case "cancelled":
      return "pending";
  }
}

export default function PlanningDailyTile({
  activity,
  agentNames,
  hourHeight,
  startHour = 0,
}: PlanningDailyTileProps) {
  const t = useTranslations("planning");
  const scheduled = new Date(activity.scheduled_at);
  const hours = scheduled.getHours();
  const minutes = scheduled.getMinutes();

  const isMeeting = activity.activity_type === "meeting";
  const payload = activity.payload as unknown as MeetingPayload | undefined;
  const durationMinutes = isMeeting && payload?.duration_minutes ? payload.duration_minutes : 30;

  const pxPerMinute = hourHeight / 60;
  const minutesSinceStart = (hours * 60 + minutes) - (startHour * 60);
  const top = minutesSinceStart * pxPerMinute;
  const height = Math.max(32, durationMinutes * pxPerMinute);

  const timeStr = scheduled.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = new Date(scheduled.getTime() + durationMinutes * 60 * 1000);
  const endStr = endTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const participants =
    isMeeting && payload?.participant_agent_ids
      ? payload.participant_agent_ids
          .map((id) => agentNames[id])
          .filter(Boolean)
          .join(", ")
      : null;

  const content = (
    <div
      className={`absolute left-16 right-2 rounded-md px-3 py-1.5 overflow-hidden border transition-colors ${
        activity.status === "completed"
          ? "bg-accent-gold-pale/60 border-accent-gold/30"
          : activity.status === "running"
          ? "bg-accent-gold-muted/30 border-accent-gold/50"
          : activity.status === "failed" || activity.status === "cancelled"
          ? "bg-surface-tertiary border-border-subtle"
          : "bg-accent-gold-muted/20 border-accent-gold-muted/40"
      } ${isMeeting ? "hover:border-accent-gold cursor-pointer" : ""}`}
      style={{ top, height, minHeight: 32 }}
    >
      <div className="flex items-start justify-between gap-2 h-full">
        <div className="min-w-0 flex-1">
          <h4 className="font-heading font-semibold text-text-primary text-sm truncate">
            {activity.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            <span>
              {timeStr} – {endStr}
            </span>
            {participants && <span className="truncate">{participants}</span>}
          </div>
        </div>
        <StatusBadge
          variant={statusVariant(activity.status)}
          label={t(`status.${activity.status}`)}
        />
      </div>
    </div>
  );

  if (isMeeting) {
    return (
      <Link href={`/meetings/${activity.id}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
