"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, StatusBadge } from "@community/ui";
import { ACTIVITIES } from "@community/shared";
import type { ScheduledActivity } from "@community/shared";

interface PlanningWeeklyViewProps {
  weekStart: Date;
  activities: ScheduledActivity[];
  agentNames: Record<string, string>;
  onSelectDay: (date: Date) => void;
}

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

export default function PlanningWeeklyView({
  weekStart,
  activities,
  agentNames,
  onSelectDay,
}: PlanningWeeklyViewProps) {
  const t = useTranslations("planning");

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const today = new Date();

  const activitiesByDay = useMemo(() => {
    const map = new Map<string, ScheduledActivity[]>();
    for (const day of days) {
      map.set(day.toDateString(), []);
    }
    for (const a of activities) {
      if (a.status === "cancelled") continue;
      const key = new Date(a.scheduled_at).toDateString();
      if (map.has(key)) {
        map.get(key)!.push(a);
      }
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      );
    }
    return map;
  }, [activities, days]);

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, i) => {
        const isToday = isSameDay(day, today);
        const dayActivities = activitiesByDay.get(day.toDateString()) ?? [];
        const dateNum = day.getDate();

        return (
          <div
            key={day.toISOString()}
            className={`rounded-lg border overflow-hidden ${
              isToday
                ? "border-accent-gold bg-accent-gold/5"
                : "border-border-subtle bg-surface-primary"
            }`}
          >
            {/* Day header */}
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              className="w-full px-2 py-2 text-center hover:bg-surface-secondary transition-colors"
            >
              <span className="text-xs text-text-tertiary uppercase block">
                {t(`calendar.days.${DAY_KEYS[i]}`)}
              </span>
              <span
                className={`text-lg font-semibold block ${
                  isToday ? "text-accent-gold" : "text-text-primary"
                }`}
              >
                {dateNum}
              </span>
            </button>

            {/* Activity list */}
            <div className="px-1.5 pb-2 space-y-1 max-h-[300px] overflow-auto">
              {dayActivities.length === 0 && (
                <p className="text-xs text-text-tertiary text-center py-3">—</p>
              )}
              {dayActivities.map((activity) => {
                const time = new Date(activity.scheduled_at).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                );
                const isMeeting = activity.activity_type === "meeting";

                const card = (
                  <div
                    key={activity.id}
                    className={`rounded-md p-1.5 text-xs border ${
                      activity.status === "completed"
                        ? "bg-accent-gold-pale/60 border-accent-gold/20"
                        : activity.status === "running"
                        ? "bg-accent-gold-muted/20 border-accent-gold/40"
                        : "bg-surface-secondary border-border-subtle"
                    } ${isMeeting ? "hover:border-accent-gold cursor-pointer" : ""}`}
                  >
                    <p className="font-semibold text-text-primary truncate">
                      {activity.title}
                    </p>
                    <p className="text-text-tertiary">{time}</p>
                  </div>
                );

                return isMeeting ? (
                  <Link key={activity.id} href={`/meetings/${activity.id}`}>
                    {card}
                  </Link>
                ) : (
                  <div key={activity.id}>{card}</div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
