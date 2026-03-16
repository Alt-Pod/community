"use client";

import { useTranslations } from "next-intl";
import { Button } from "@community/ui";
import type { PlanningViewMode } from "@/components/planning-view-selector";

interface PlanningNavigationProps {
  view: PlanningViewMode;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

function formatLabel(view: PlanningViewMode, date: Date): string {
  switch (view) {
    case "daily":
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    case "weekly": {
      const dayOfWeek = date.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(date);
      monday.setDate(date.getDate() + mondayOffset);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const startStr = monday.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const endStr = sunday.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${startStr} – ${endStr}`;
    }
    case "monthly":
      return date.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
  }
}

export default function PlanningNavigation({
  view,
  currentDate,
  onPrev,
  onNext,
  onToday,
}: PlanningNavigationProps) {
  const t = useTranslations("planning.navigation");

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onPrev}>
          {t("previous")}
        </Button>
        <Button variant="secondary" onClick={onToday}>
          {t("today")}
        </Button>
        <Button variant="secondary" onClick={onNext}>
          {t("next")}
        </Button>
      </div>
      <h2 className="font-heading text-lg font-semibold text-text-primary capitalize">
        {formatLabel(view, currentDate)}
      </h2>
    </div>
  );
}
