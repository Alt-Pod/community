"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, StatusBadge } from "@community/ui";
import { ACTIVITIES } from "@community/shared";
import type { ScheduledActivity } from "@community/shared";
import { useScheduledActivities } from "@/requests/useScheduledActivities";
import { useAgents } from "@/requests/useAgents";

function getWeekRange(): { start: Date; end: Date; days: Date[] } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }

  return { start, end, days };
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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function WeeklyPlanning() {
  const t = useTranslations("planning");
  const tHome = useTranslations("home");

  const { start, end, days } = useMemo(() => getWeekRange(), []);
  const { data: activities = [] } = useScheduledActivities(
    start.toISOString(),
    end.toISOString()
  );
  const { data: agents = [] } = useAgents();

  const agentNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of agents) map[a.id] = a.name;
    return map;
  }, [agents]);

  const today = new Date();

  const activitiesByDay = useMemo(() => {
    const map = new Map<string, ScheduledActivity[]>();
    for (const day of days) {
      map.set(day.toDateString(), []);
    }
    for (const a of activities) {
      const key = new Date(a.scheduled_at).toDateString();
      if (map.has(key)) {
        map.get(key)!.push(a);
      }
    }
    return map;
  }, [activities, days]);

  const todayActivities = activitiesByDay.get(today.toDateString()) ?? [];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-semibold text-text-primary">
          {tHome("planning.title")}
        </h2>
        <Link
          href="/planning"
          className="text-sm text-accent-gold hover:text-accent-gold-light transition-colors"
        >
          {tHome("planning.viewAll")}
        </Link>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const dayActivities = activitiesByDay.get(day.toDateString()) ?? [];
          const dayLabel = day.toLocaleDateString(undefined, { weekday: "short" });
          const dateNum = day.getDate();

          return (
            <div
              key={day.toISOString()}
              className={`flex flex-col items-center rounded-lg py-3 px-1 transition-colors ${
                isToday
                  ? "bg-accent-gold/10 border border-accent-gold"
                  : "bg-surface-secondary border border-border-subtle"
              }`}
            >
              <span className="text-xs text-text-tertiary uppercase">
                {dayLabel}
              </span>
              <span
                className={`text-lg font-semibold mt-0.5 ${
                  isToday ? "text-accent-gold" : "text-text-primary"
                }`}
              >
                {dateNum}
              </span>
              {dayActivities.length > 0 && (
                <div className="flex gap-0.5 mt-1.5">
                  {dayActivities.slice(0, 3).map((a) => (
                    <span
                      key={a.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        a.status === "completed"
                          ? "bg-accent-gold"
                          : a.status === "failed" || a.status === "cancelled"
                          ? "bg-text-tertiary"
                          : "bg-accent-gold-muted"
                      }`}
                    />
                  ))}
                  {dayActivities.length > 3 && (
                    <span className="text-[10px] text-text-tertiary leading-none">
                      +{dayActivities.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Today's detail */}
      <div>
        <h3 className="font-heading text-base font-semibold text-text-primary mb-3">
          {tHome("planning.today")}
        </h3>
        {todayActivities.length === 0 ? (
          <p className="text-text-tertiary text-sm py-4 text-center">
            {t("calendar.noActivities")}
          </p>
        ) : (
          <div className="space-y-2">
            {todayActivities.map((activity) => {
              const activityDef =
                ACTIVITIES[activity.activity_type as keyof typeof ACTIVITIES];
              const time = new Date(activity.scheduled_at).toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              );

              return (
                <Card key={activity.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading font-semibold text-text-primary text-sm truncate">
                        {activity.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-text-tertiary">
                        <span>{time}</span>
                        {activityDef && <span>{activityDef.name}</span>}
                        {activity.agent_id &&
                          agentNames[activity.agent_id] && (
                            <span>{agentNames[activity.agent_id]}</span>
                          )}
                      </div>
                    </div>
                    <StatusBadge
                      variant={statusVariant(activity.status)}
                      label={t(`status.${activity.status}`)}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
