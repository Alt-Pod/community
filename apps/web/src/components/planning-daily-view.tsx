"use client";

import { useMemo, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { ScheduledActivity } from "@community/shared";
import PlanningDailyTile from "@/components/planning-daily-tile";

interface PlanningDailyViewProps {
  date: Date;
  activities: ScheduledActivity[];
  agentNames: Record<string, string>;
  hourHeight?: number;
  startHour?: number;
  endHour?: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function PlanningDailyView({
  date,
  activities,
  agentNames,
  hourHeight = 64,
  startHour = 0,
  endHour = 24,
}: PlanningDailyViewProps) {
  const t = useTranslations("planning.daily");
  const containerRef = useRef<HTMLDivElement>(null);

  const dayActivities = useMemo(() => {
    return activities
      .filter((a) => {
        const d = new Date(a.scheduled_at);
        return isSameDay(d, date) && a.status !== "cancelled";
      })
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      );
  }, [activities, date]);

  const visibleHours = useMemo(
    () => HOURS.filter((h) => h >= startHour && h < endHour),
    [startHour, endHour]
  );

  const now = new Date();
  const isToday = isSameDay(date, now);

  // Auto-scroll to current hour or first activity
  useEffect(() => {
    if (!containerRef.current) return;
    let scrollToHour: number;
    if (isToday) {
      scrollToHour = now.getHours();
    } else if (dayActivities.length > 0) {
      scrollToHour = new Date(dayActivities[0].scheduled_at).getHours();
    } else {
      scrollToHour = 8; // default to 8am
    }
    const scrollTop = Math.max(0, (scrollToHour - startHour - 1) * hourHeight);
    containerRef.current.scrollTop = scrollTop;
  }, [date.toDateString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalHeight = (endHour - startHour) * hourHeight;

  // Current time indicator position
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - startHour * 60) / ((endHour - startHour) * 60)) * totalHeight;

  if (dayActivities.length === 0) {
    return (
      <div className="relative overflow-auto max-h-[600px] rounded-lg border border-border-subtle bg-surface-primary" ref={containerRef}>
        <div className="relative" style={{ height: totalHeight }}>
          {visibleHours.map((hour) => {
            const y = (hour - startHour) * hourHeight;
            return (
              <div key={hour} className="absolute left-0 right-0" style={{ top: y }}>
                <div className="flex items-start">
                  <span className="w-14 text-right pr-3 text-xs text-text-tertiary -mt-2 select-none">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                  <div className="flex-1 border-t border-border-subtle" />
                </div>
              </div>
            );
          })}
          {isToday && nowTop >= 0 && nowTop <= totalHeight && (
            <div className="absolute left-14 right-0 flex items-center z-20" style={{ top: nowTop }}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
              <div className="flex-1 border-t-2 border-red-500" />
            </div>
          )}
        </div>
        <p className="absolute inset-0 flex items-center justify-center text-text-tertiary text-sm pointer-events-none">
          {t("noActivities")}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto max-h-[600px] rounded-lg border border-border-subtle bg-surface-primary"
    >
      <div className="relative" style={{ height: totalHeight }}>
        {/* Hour gridlines */}
        {visibleHours.map((hour) => {
          const y = (hour - startHour) * hourHeight;
          return (
            <div key={hour} className="absolute left-0 right-0" style={{ top: y }}>
              <div className="flex items-start">
                <span className="w-14 text-right pr-3 text-xs text-text-tertiary -mt-2 select-none">
                  {hour.toString().padStart(2, "0")}:00
                </span>
                <div className="flex-1 border-t border-border-subtle" />
              </div>
            </div>
          );
        })}

        {/* Current time indicator */}
        {isToday && nowTop >= 0 && nowTop <= totalHeight && (
          <div className="absolute left-14 right-0 flex items-center z-20" style={{ top: nowTop }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
            <div className="flex-1 border-t-2 border-red-500" />
          </div>
        )}

        {/* Activity tiles */}
        {dayActivities.map((activity) => (
          <PlanningDailyTile
            key={activity.id}
            activity={activity}
            agentNames={agentNames}
            hourHeight={hourHeight}
            startHour={startHour}
          />
        ))}
      </div>
    </div>
  );
}
