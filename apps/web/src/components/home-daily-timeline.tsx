"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LoadingIndicator } from "@community/ui";
import type { ScheduledActivity } from "@community/shared";
import { useScheduledActivities } from "@/requests/useScheduledActivities";
import { useAgents } from "@/requests/useAgents";
import PlanningDailyTile from "@/components/planning-daily-tile";

const HOUR_HEIGHT = 48;
const START_HOUR = 7;
const END_HOUR = 21;
const VISIBLE_HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => i + START_HOUR
);

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function HomeDailyTimeline() {
  const t = useTranslations("home.planning");

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const { data: activities = [], isLoading: activitiesLoading } =
    useScheduledActivities(todayStart.toISOString(), todayEnd.toISOString());
  const { data: agents = [], isLoading: agentsLoading } = useAgents();

  const agentNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of agents) map[a.id] = a.name;
    return map;
  }, [agents]);

  const dayActivities = useMemo(() => {
    return activities
      .filter((a) => {
        const d = new Date(a.scheduled_at);
        return isSameDay(d, now) && a.status !== "cancelled";
      })
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime()
      );
  }, [activities]);

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  // Current time indicator
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop =
    ((nowMinutes - START_HOUR * 60) / ((END_HOUR - START_HOUR) * 60)) *
    totalHeight;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-semibold text-text-primary">
          {t("title")}
        </h2>
        <Link
          href="/planning?view=daily"
          className="text-sm text-accent-gold hover:text-accent-gold-light transition-colors"
        >
          {t("viewAll")}
        </Link>
      </div>

      {(activitiesLoading || agentsLoading) && (
        <LoadingIndicator variant="inline" className="mb-4" />
      )}

      {!activitiesLoading && dayActivities.length === 0 ? (
        <p className="text-text-tertiary text-sm py-4 text-center">
          {t("noActivities")}
        </p>
      ) : (
        <div className="relative overflow-auto max-h-[400px] rounded-lg border border-border-subtle bg-surface-primary">
          <div className="relative" style={{ height: totalHeight }}>
            {/* Hour gridlines */}
            {VISIBLE_HOURS.map((hour) => {
              const y = (hour - START_HOUR) * HOUR_HEIGHT;
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0"
                  style={{ top: y }}
                >
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
            {nowTop >= 0 && nowTop <= totalHeight && (
              <div
                className="absolute left-14 right-0 flex items-center z-20"
                style={{ top: nowTop }}
              >
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
                hourHeight={HOUR_HEIGHT}
                startHour={START_HOUR}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
