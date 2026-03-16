"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLogbookEntries } from "@/requests/useLogbook";

function formatEntryDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getPreview(content: string): string {
  const firstLine = content
    .split("\n")
    .find((l) => l.trim() && !l.startsWith("#"));
  if (!firstLine) return "";
  return firstLine.slice(0, 120) + (firstLine.length > 120 ? "..." : "");
}

export default function LogbookEntryList() {
  const t = useTranslations("logbook");
  const { data: entries = [], isLoading } = useLogbookEntries({ limit: 14 });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-surface-tertiary rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-text-tertiary py-4">{t("noEntry")}</p>
    );
  }

  return (
    <div>
      <h3 className="font-heading text-sm font-semibold text-text-primary mb-3">
        {t("entries")}
      </h3>
      <div className="space-y-1">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/logbook?date=${entry.entry_date}`}
            className="block p-3 rounded-lg border border-border-subtle hover:border-accent-gold-muted hover:bg-accent-gold-pale/5 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">
                {formatEntryDate(entry.entry_date)}
              </span>
              <span className="text-xs text-text-tertiary">
                v{entry.version}
              </span>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">
              {getPreview(entry.content)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
