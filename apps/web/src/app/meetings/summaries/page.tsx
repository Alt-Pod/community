"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Heading, Card, LoadingIndicator, Collapsible } from "@community/ui";
import { useMeetingSummaries } from "@/requests/useMeetingSummaries";
import MarkdownMessage from "@/components/markdown-message";

export default function MeetingSummariesPage() {
  const t = useTranslations("meetings");
  const { data: summaries = [], isLoading } = useMeetingSummaries();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <Heading as="h1" className="text-2xl">
          {t("summaries.title")}
        </Heading>
        <Link
          href="/meetings"
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          {t("title")}
        </Link>
      </div>

      {isLoading && <LoadingIndicator variant="inline" text={t("loading")} />}

      {!isLoading && summaries.length === 0 && (
        <p className="text-sm text-text-tertiary text-center py-10">
          {t("summaries.noSummaries")}
        </p>
      )}

      <div className="space-y-4">
        {summaries.map((summary, index) => (
          <Card key={summary.id}>
            <Collapsible
              defaultOpen={index === 0}
              title={
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-heading font-semibold text-text-primary">
                    {summary.summaryTitle ?? summary.activityTitle ?? t("summaries.untitled")}
                  </h3>
                  {summary.scheduledAt && (
                    <span className="text-xs text-text-tertiary">
                      {new Date(summary.scheduledAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                </div>
              }
            >
              <div className="text-sm text-text-secondary">
                <MarkdownMessage content={summary.content} />
              </div>
              {summary.activityId && (
                <Link
                  href={`/meetings/${summary.activityId}`}
                  className="text-xs text-accent hover:underline mt-2 inline-block"
                >
                  {t("summaries.viewMeeting")}
                </Link>
              )}
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}
