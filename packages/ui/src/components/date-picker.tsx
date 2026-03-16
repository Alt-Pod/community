"use client";

import { useState, useRef, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { useClickOutside } from "../hooks/use-click-outside";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  placeholder?: string;
  locale?: Locale;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  placeholder = "Select a date",
  locale,
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrapperRef, close);

  function handleSelect(date: Date | undefined) {
    onChange(date);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }

  const displayValue = value
    ? format(value, "PPP", locale ? { locale } : undefined)
    : "";

  return (
    <div ref={wrapperRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-sm bg-surface-tertiary border border-border-subtle px-4 py-2.5 text-sm text-left transition-colors duration-150 focus:outline-none focus:border-accent-gold focus:shadow-gold-glow"
      >
        {displayValue ? (
          <span className="text-text-primary">{displayValue}</span>
        ) : (
          <span className="text-text-tertiary">{placeholder}</span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 rounded-md border border-border-subtle bg-surface-primary shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            defaultMonth={value || new Date()}
            disabled={minDate ? { before: minDate } : undefined}
            locale={locale}
            classNames={{
              root: "text-text-primary",
              months: "flex flex-col",
              month_caption: "flex justify-center items-center h-10",
              caption_label: "text-sm font-medium text-text-primary",
              nav: "absolute flex items-center justify-between w-full px-1 top-3",
              button_previous:
                "size-7 inline-flex items-center justify-center rounded-sm text-text-secondary hover:text-accent-gold hover:bg-surface-tertiary transition-colors",
              button_next:
                "size-7 inline-flex items-center justify-center rounded-sm text-text-secondary hover:text-accent-gold hover:bg-surface-tertiary transition-colors",
              weekdays: "flex",
              weekday:
                "w-9 text-center text-xs font-medium text-text-tertiary py-1",
              week: "flex",
              day: "p-0",
              day_button:
                "size-9 inline-flex items-center justify-center rounded-full text-sm transition-colors hover:bg-surface-tertiary focus:outline-none",
              selected:
                "!bg-accent-gold !text-white font-semibold hover:!bg-accent-gold",
              today: "ring-1 ring-accent-gold ring-inset",
              outside: "text-text-tertiary opacity-40",
              disabled: "text-text-tertiary opacity-30 cursor-not-allowed hover:bg-transparent",
              hidden: "invisible",
            }}
          />
        </div>
      )}
    </div>
  );
}
