"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ScheduledActivity } from "@community/shared";

interface PlanningCalendarProps {
  year: number;
  month: number; // 0-indexed
  activities: ScheduledActivity[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export default function PlanningCalendar({
  year,
  month,
  activities,
  selectedDay,
  onSelectDay,
}: PlanningCalendarProps) {
  const t = useTranslations("planning.calendar");

  const { days, startOffset } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // 0 = Sunday, we want Monday = 0
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    return {
      days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      startOffset: offset,
    };
  }, [year, month]);

  const activitiesByDay = useMemo(() => {
    const map = new Map<number, ScheduledActivity[]>();
    for (const a of activities) {
      const d = new Date(a.scheduled_at);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(a);
      }
    }
    return map;
  }, [activities, year, month]);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  return (
    <div>
      <div className="grid grid-cols-7 gap-px mb-1">
        {DAY_KEYS.map((key) => (
          <div
            key={key}
            className="py-2 text-center text-xs font-medium text-text-tertiary uppercase"
          >
            {t(`days.${key}`)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border-subtle rounded-md overflow-hidden">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-surface-secondary p-2 min-h-[80px]" />
        ))}
        {days.map((day) => {
          const dayActivities = activitiesByDay.get(day) ?? [];
          const isSelected = selectedDay === day;
          const isToday = isCurrentMonth && todayDate === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`bg-surface-primary p-2 min-h-[80px] text-left transition-colors hover:bg-surface-secondary ${
                isSelected
                  ? "ring-2 ring-inset ring-accent-gold"
                  : ""
              }`}
            >
              <span
                className={`inline-flex items-center justify-center text-sm w-6 h-6 rounded-full ${
                  isToday
                    ? "bg-accent-gold text-white font-semibold"
                    : "text-text-primary"
                }`}
              >
                {day}
              </span>
              {dayActivities.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {dayActivities.slice(0, 3).map((a) => (
                    <span
                      key={a.id}
                      className={`block w-full text-xs truncate px-1 py-0.5 rounded ${
                        a.status === "completed"
                          ? "bg-accent-gold-pale text-accent-gold"
                          : a.status === "cancelled" || a.status === "failed"
                          ? "bg-surface-tertiary text-text-tertiary"
                          : "bg-accent-gold-muted/30 text-text-secondary"
                      }`}
                      title={a.title}
                    >
                      {a.title}
                    </span>
                  ))}
                  {dayActivities.length > 3 && (
                    <span className="text-xs text-text-tertiary px-1">
                      +{dayActivities.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
