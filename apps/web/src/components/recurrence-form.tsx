"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Select, TextInput, DatePicker } from "@community/ui";

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endCondition: "never" | "after" | "by_date";
  endAfterOccurrences?: number;
  endByDate?: Date;
}

interface RecurrenceFormProps {
  value: RecurrenceRule;
  onChange: (rule: RecurrenceRule) => void;
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export default function RecurrenceForm({ value, onChange }: RecurrenceFormProps) {
  const t = useTranslations("planning.recurrence");

  const unitLabel =
    value.frequency === "daily"
      ? t("units.days")
      : value.frequency === "weekly"
        ? t("units.weeks")
        : t("units.months");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t("frequencyLabel")}
          </label>
          <Select
            value={value.frequency}
            onChange={(e) =>
              onChange({ ...value, frequency: e.target.value as RecurrenceRule["frequency"] })
            }
            options={[
              { value: "daily", label: t("frequency.daily") },
              { value: "weekly", label: t("frequency.weekly") },
              { value: "monthly", label: t("frequency.monthly") },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t("intervalLabel", { unit: unitLabel })}
          </label>
          <TextInput
            type="number"
            min={1}
            value={String(value.interval)}
            onChange={(e) => onChange({ ...value, interval: Math.max(1, parseInt(e.target.value) || 1) })}
          />
        </div>
      </div>

      {value.frequency === "weekly" && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t("daysOfWeekLabel")}
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {DAY_KEYS.map((dayKey, i) => {
              const selected = value.daysOfWeek?.includes(i) ?? false;
              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => {
                    const current = value.daysOfWeek ?? [];
                    const next = selected
                      ? current.filter((d) => d !== i)
                      : [...current, i].sort((a, b) => a - b);
                    onChange({ ...value, daysOfWeek: next });
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    selected
                      ? "bg-accent text-white border-accent"
                      : "bg-bg-primary text-text-secondary border-border hover:border-accent"
                  }`}
                >
                  {t(`days.${dayKey}`)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {value.frequency === "monthly" && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t("dayOfMonthLabel")}
          </label>
          <TextInput
            type="number"
            min={1}
            max={31}
            value={String(value.dayOfMonth ?? 1)}
            onChange={(e) =>
              onChange({ ...value, dayOfMonth: Math.min(31, Math.max(1, parseInt(e.target.value) || 1)) })
            }
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {t("endConditionLabel")}
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="endCondition"
              checked={value.endCondition === "never"}
              onChange={() => onChange({ ...value, endCondition: "never" })}
              className="border-border"
            />
            <span className="text-sm text-text-primary">{t("endCondition.never")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="endCondition"
              checked={value.endCondition === "after"}
              onChange={() => onChange({ ...value, endCondition: "after", endAfterOccurrences: value.endAfterOccurrences ?? 10 })}
              className="border-border"
            />
            <span className="text-sm text-text-primary">{t("endCondition.after")}</span>
            {value.endCondition === "after" && (
              <TextInput
                type="number"
                min={1}
                value={String(value.endAfterOccurrences ?? 10)}
                onChange={(e) =>
                  onChange({ ...value, endAfterOccurrences: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="w-20"
              />
            )}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="endCondition"
              checked={value.endCondition === "by_date"}
              onChange={() => onChange({ ...value, endCondition: "by_date" })}
              className="border-border"
            />
            <span className="text-sm text-text-primary">{t("endCondition.byDate")}</span>
            {value.endCondition === "by_date" && (
              <DatePicker
                value={value.endByDate}
                onChange={(d) => onChange({ ...value, endByDate: d })}
                minDate={new Date()}
                placeholder={t("endCondition.datePlaceholder")}
              />
            )}
          </label>
        </div>
      </div>
    </div>
  );
}
