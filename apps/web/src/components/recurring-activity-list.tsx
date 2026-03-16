"use client";

import { useTranslations } from "next-intl";
import { Button, Card, StatusBadge } from "@community/ui";
import type { RecurringActivity } from "@community/shared";
import {
  useDeleteRecurringActivity,
  usePauseRecurringActivity,
} from "@/requests/useRecurringActivities";

interface RecurringActivityListProps {
  activities: RecurringActivity[];
}

function frequencySummary(a: RecurringActivity, t: ReturnType<typeof useTranslations>): string {
  const time = a.time_of_day.slice(0, 5); // "HH:MM"
  const interval = a.interval_value;

  if (a.frequency === "daily") {
    if (interval === 1) return t("summary.everyDay", { time });
    return t("summary.everyNDays", { count: interval, time });
  }

  if (a.frequency === "weekly") {
    const dayNames = (a.days_of_week ?? [])
      .map((d) => t(`days.${["sun", "mon", "tue", "wed", "thu", "fri", "sat"][d]}`))
      .join(", ");
    if (interval === 1) return t("summary.everyWeek", { days: dayNames, time });
    return t("summary.everyNWeeks", { count: interval, days: dayNames, time });
  }

  if (a.frequency === "monthly") {
    const day = a.day_of_month ?? parseInt(a.start_date.split("-")[2], 10);
    if (interval === 1) return t("summary.everyMonth", { day, time });
    return t("summary.everyNMonths", { count: interval, day, time });
  }

  return "";
}

function statusVariant(status: string): "pending" | "running" | "success" | "error" {
  switch (status) {
    case "active":
      return "success";
    case "paused":
      return "pending";
    case "deleted":
      return "error";
    default:
      return "pending";
  }
}

export default function RecurringActivityList({ activities }: RecurringActivityListProps) {
  const t = useTranslations("planning.recurringActivities");
  const ts = useTranslations("planning.recurrence");
  const deleteMutation = useDeleteRecurringActivity();
  const pauseMutation = usePauseRecurringActivity();

  if (activities.length === 0) {
    return (
      <p className="text-text-tertiary text-sm text-center py-6">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="font-heading font-semibold text-text-primary truncate">
                {activity.title}
              </h4>
              <p className="text-sm text-text-secondary mt-0.5">
                {frequencySummary(activity, ts)}
              </p>
              {activity.description && (
                <p className="text-xs text-text-tertiary mt-1">{activity.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-text-tertiary">
                <span>{activity.activity_type}</span>
                <span>{activity.timezone}</span>
                <span>{t("occurrences", { count: activity.occurrences_created })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge
                variant={statusVariant(activity.status)}
                label={t(`status.${activity.status}`)}
              />
              {activity.status === "active" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    pauseMutation.mutate({ id: activity.id, status: "paused" })
                  }
                  disabled={pauseMutation.isPending}
                >
                  {t("pause")}
                </Button>
              )}
              {activity.status === "paused" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    pauseMutation.mutate({ id: activity.id, status: "active" })
                  }
                  disabled={pauseMutation.isPending}
                >
                  {t("resume")}
                </Button>
              )}
              {activity.status !== "deleted" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    deleteMutation.mutate({ id: activity.id, cancelFuture: true })
                  }
                  disabled={deleteMutation.isPending}
                >
                  {t("delete")}
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
