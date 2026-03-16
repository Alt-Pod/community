"use client";

import { useTranslations } from "next-intl";
import { Card, StatusBadge, Heading, LoadingIndicator, Collapsible } from "@community/ui";
import { useMeeting } from "@/requests/useMeetings";
import MarkdownMessage from "@/components/markdown-message";
import { getEffectiveMeetingTimes } from "@/lib/meeting-time";
import type { DbMessage } from "@community/shared";

interface MeetingViewerProps {
  meetingId: string;
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
    case "cancelled":
      return "pending";
    default:
      return "pending";
  }
}

export default function MeetingViewer({ meetingId }: MeetingViewerProps) {
  const t = useTranslations("meetings");
  const { data: meeting, isLoading, error } = useMeeting(meetingId);

  if (isLoading) {
    return <LoadingIndicator variant="inline" text={t("viewer.loading")} />;
  }

  if (error || !meeting) {
    return <p className="text-red-500">{t("viewer.error")}</p>;
  }

  const { activity, participants, messages, agenda, duration_minutes, timezone, summary, summary_title } =
    meeting;

  const times = getEffectiveMeetingTimes(activity);

  // Build a map of agent_id -> agent name for message attribution
  const agentNameMap = new Map<string, string>();
  for (const p of participants) {
    agentNameMap.set(p.id, p.name);
  }

  const startStr = times.startTime.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const endStr = times.endTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Heading as="h1" className="text-2xl">
            {activity.title}
          </Heading>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary">
            <span>{startStr} – {endStr}</span>
            {times.isActual && times.durationMinutes !== times.scheduledDurationMinutes ? (
              <span>
                {times.durationMinutes} min ({t("viewer.actualDuration")}) · {times.scheduledDurationMinutes} min ({t("viewer.scheduledDuration")})
              </span>
            ) : (
              <span>{duration_minutes} min</span>
            )}
            <span>{timezone}</span>
          </div>
        </div>
        <StatusBadge
          variant={statusVariant(activity.status)}
          label={t(`status.${activity.status}`)}
        />
      </div>

      {/* Agenda */}
      <Card>
        <Heading as="h3" className="text-sm font-semibold mb-2">
          {t("agenda")}
        </Heading>
        <p className="text-sm text-text-secondary whitespace-pre-wrap">{agenda}</p>
      </Card>

      {/* Participants */}
      <Card>
        <Heading as="h3" className="text-sm font-semibold mb-2">
          {t("participants")}
        </Heading>
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-bg-secondary text-text-primary"
            >
              {p.name}
            </span>
          ))}
        </div>
      </Card>

      {/* Read-only notice */}
      <p className="text-xs text-text-tertiary italic">{t("viewer.readOnly")}</p>

      {/* Transcript */}
      {messages.length > 0 ? (
        <div className="space-y-3">
          <Heading as="h3" className="text-base">
            {t("viewer.transcript")}
          </Heading>
          {(messages as DbMessage[]).map((msg) => {
            const parts = ((msg as any).parts ?? []) as { type?: string; speakerType?: string }[];
            const isDefaultAssistant = parts.some(
              (p) => p.type === "speaker-tag" && p.speakerType === "default-assistant"
            );
            const isMaster = !msg.agent_id && !isDefaultAssistant;

            const speakerName = isDefaultAssistant
              ? "Assistant"
              : isMaster
                ? t("viewer.meetingMaster")
                : msg.agent_id
                  ? agentNameMap.get(msg.agent_id) ?? t("viewer.unknownAgent")
                  : t("viewer.meetingMaster");

            return (
              <div
                key={msg.id}
                className={`rounded-lg p-3 ${
                  isMaster
                    ? "bg-bg-secondary border border-border"
                    : "bg-bg-primary border border-border"
                }`}

              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold ${
                      isMaster ? "text-accent" : "text-text-primary"
                    }`}
                  >
                    {speakerName}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text-sm text-text-secondary">
                  <MarkdownMessage content={msg.content} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-tertiary text-center py-6">
          {t("viewer.noMessages")}
        </p>
      )}

      {/* Summary */}
      {summary && (
        <Card>
          <Collapsible
            defaultOpen
            title={
              <Heading as="h3" className="text-sm font-semibold">
                {summary_title ?? t("summary")}
              </Heading>
            }
          >
            <div className="text-sm text-text-secondary">
              <MarkdownMessage content={summary} />
            </div>
          </Collapsible>
        </Card>
      )}
    </div>
  );
}
