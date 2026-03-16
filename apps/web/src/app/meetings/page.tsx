"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button, Heading, Card, StatusBadge, LoadingIndicator, SearchInput } from "@community/ui";
import { useMeetings } from "@/requests/useMeetings";
import { useProfile } from "@/requests/useProfile";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { getEffectiveMeetingTimes } from "@/lib/meeting-time";
import MeetingScheduleForm from "@/components/meeting-schedule-form";
import type { ScheduledActivity } from "@community/shared";

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

export default function MeetingsPage() {
  const t = useTranslations("meetings");
  const tSearch = useTranslations("search");
  const { data: meetings = [], isLoading } = useMeetings();
  const { data: profile } = useProfile();
  const [showForm, setShowForm] = useState(false);

  const activeMeetings = meetings.filter((m) => m.status !== "cancelled");
  const cancelledMeetings = meetings.filter((m) => m.status === "cancelled");

  const fieldExtractor = useCallback(
    (m: { title: string; description?: string | null; participants: { name: string }[] }) => [
      m.title,
      m.description ?? "",
      ...m.participants.map((p) => p.name),
    ],
    [],
  );
  const { query, setQuery, results } = useFuzzySearch(activeMeetings, fieldExtractor);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <Heading as="h1" className="text-2xl">
          {t("title")}
        </Heading>
        <div className="flex items-center gap-2">
          <Link
            href="/meetings/summaries"
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-sm transition-colors"
          >
            {t("summaries.title")}
          </Link>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? t("hideForm") : t("scheduleMeeting")}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <Card>
            <MeetingScheduleForm
              defaultTimezone={profile?.timezone}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </Card>
        </div>
      )}

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={tSearch("placeholder")}
        className="mb-6"
      />

      {isLoading && <LoadingIndicator variant="inline" text={t("loading")} />}

      {!query && !isLoading && activeMeetings.length === 0 && (
        <p className="text-sm text-text-tertiary text-center py-10">
          {t("noMeetings")}
        </p>
      )}

      <div className="space-y-3">
        {results.map((meeting) => (
          <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="block">
            <Card className="hover:border-accent transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-semibold text-text-primary truncate">
                    {meeting.title}
                  </h3>
                  {meeting.description && (
                    <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                      {meeting.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-tertiary">
                    {(() => {
                      const times = getEffectiveMeetingTimes(meeting as unknown as ScheduledActivity);
                      const dateStr = times.startTime.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      });
                      const endStr = times.endTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      return <span>{dateStr} – {endStr}</span>;
                    })()}
                    {meeting.participants.length > 0 && (
                      <span>
                        {meeting.participants.map((p) => p.name).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge
                  variant={statusVariant(meeting.status)}
                  label={t(`status.${meeting.status}`)}
                />
              </div>
            </Card>
          </Link>
        ))}

        {query && results.length === 0 && (
          <p className="text-sm text-text-tertiary text-center py-8">
            {tSearch("noResults")}
          </p>
        )}
      </div>

      {!query && cancelledMeetings.length > 0 && (
        <div className="mt-10">
          <Heading as="h2" className="text-lg mb-4 text-text-secondary">
            {t("cancelledSection")}
          </Heading>
          <div className="space-y-3">
            {cancelledMeetings.map((meeting) => (
              <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="block">
                <Card className="hover:border-accent transition-colors cursor-pointer opacity-60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-semibold text-text-primary truncate">
                        {meeting.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-tertiary">
                        <span>
                          {new Date(meeting.scheduled_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        {meeting.participants.length > 0 && (
                          <span>
                            {meeting.participants.map((p) => p.name).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge
                      variant={statusVariant(meeting.status)}
                      label={t(`status.${meeting.status}`)}
                    />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
