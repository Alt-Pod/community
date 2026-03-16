"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLogbookEntry } from "@/requests/useLogbook";
import MarkdownMessage from "./markdown-message";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function LogbookViewer() {
  const t = useTranslations("logbook");
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: entry, isLoading } = useLogbookEntry(selectedDate);

  const isToday = selectedDate === today;
  const isFuture = selectedDate > today;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
          className="px-3 py-1.5 text-sm rounded border border-border-subtle hover:bg-surface-tertiary transition-colors"
        >
          {t("previousDay")}
        </button>

        <div className="text-center">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            {formatDate(selectedDate)}
          </h2>
          {entry?.version && entry.version > 1 && (
            <p className="text-xs text-text-tertiary mt-0.5">
              {t("version", { version: entry.version })}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {!isToday && (
            <button
              onClick={() => setSelectedDate(today)}
              className="px-3 py-1.5 text-sm rounded border border-accent-gold-muted text-accent-gold hover:bg-accent-gold-pale/20 transition-colors"
            >
              {t("today")}
            </button>
          )}
          <button
            onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
            disabled={isFuture}
            className="px-3 py-1.5 text-sm rounded border border-border-subtle hover:bg-surface-tertiary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("nextDay")}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-4 w-3/4 bg-surface-tertiary rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-surface-tertiary rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-surface-tertiary rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-surface-tertiary rounded animate-pulse" />
        </div>
      )}

      {!isLoading && !entry && (
        <div className="text-center py-12">
          <p className="text-text-tertiary">{t("noEntry")}</p>
        </div>
      )}

      {!isLoading && entry && (
        <div className="text-sm text-text-secondary">
          <MarkdownMessage content={entry.content} />
        </div>
      )}
    </div>
  );
}
