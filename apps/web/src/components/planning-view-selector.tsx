"use client";

import { useTranslations } from "next-intl";

export type PlanningViewMode = "daily" | "weekly" | "monthly";

interface PlanningViewSelectorProps {
  value: PlanningViewMode;
  onChange: (view: PlanningViewMode) => void;
}

const VIEWS: PlanningViewMode[] = ["daily", "weekly", "monthly"];

export default function PlanningViewSelector({
  value,
  onChange,
}: PlanningViewSelectorProps) {
  const t = useTranslations("planning.views");

  return (
    <div className="inline-flex rounded-lg bg-surface-secondary p-1 gap-1">
      {VIEWS.map((view) => (
        <button
          key={view}
          type="button"
          onClick={() => onChange(view)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === view
              ? "bg-accent-gold text-white shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
          }`}
        >
          {t(view)}
        </button>
      ))}
    </div>
  );
}
