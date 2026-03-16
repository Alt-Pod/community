"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card, StatusBadge } from "@community/ui";
import { ACTIVITIES } from "@community/shared";
import type { ScheduledActivity } from "@community/shared";

interface ScheduledActivityListProps {
  activities: ScheduledActivity[];
  agentNames: Record<string, string>;
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

export default function ScheduledActivityList({
  activities,
  agentNames,
}: ScheduledActivityListProps) {
  const t = useTranslations("planning");

  if (activities.length === 0) {
    return (
      <p className="text-text-tertiary text-sm text-center py-6">
        {t("calendar.noActivities")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const activityDef = ACTIVITIES[activity.activity_type as keyof typeof ACTIVITIES];
        const time = new Date(activity.scheduled_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const isMeeting = activity.activity_type === "meeting";
        const content = (
          <Card className={isMeeting ? "hover:border-accent transition-colors cursor-pointer" : undefined}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="font-heading font-semibold text-text-primary truncate">
                  {activity.title}
                </h4>
                {activity.description && (
                  <p className="text-sm text-text-secondary mt-0.5">
                    {activity.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-tertiary">
                  <span>{time}</span>
                  {activityDef && <span>{activityDef.name}</span>}
                  {activity.agent_id && agentNames[activity.agent_id] && (
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

        return isMeeting ? (
          <Link key={activity.id} href={`/meetings/${activity.id}`}>
            {content}
          </Link>
        ) : (
          <div key={activity.id}>{content}</div>
        );
      })}
    </div>
  );
}
