"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useTodayLogbook } from "@/requests/useLogbook";
import MarkdownMessage from "./markdown-message";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HomeLogbook() {
  const t = useTranslations("home");
  const { data: entry, isLoading } = useTodayLogbook();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-base font-semibold text-text-primary">
          {t("logbook.title")}
        </h3>
        <Link
          href="/logbook"
          className="text-xs text-text-tertiary hover:text-text-primary"
        >
          {t("logbook.viewAll")}
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="h-3 w-3/4 bg-surface-tertiary rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-surface-tertiary rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-surface-tertiary rounded animate-pulse" />
        </div>
      )}

      {!isLoading && !entry && (
        <p className="text-sm text-text-tertiary">{t("logbook.empty")}</p>
      )}

      {!isLoading && entry && (
        <div>
          <div className="prose prose-sm max-w-none text-sm text-text-secondary max-h-[300px] overflow-y-auto">
            <MarkdownMessage content={entry.content} />
          </div>
          {entry.last_enriched_at && (
            <p className="mt-3 text-xs text-text-tertiary">
              {t("logbook.lastUpdated", { time: timeAgo(entry.last_enriched_at) })}
              {entry.version > 1 && (
                <span className="ml-2">
                  {t("logbook.updatedTimes", { count: entry.version })}
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
