"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useClickOutside } from "../hooks/use-click-outside";

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (time: string) => void;
  interval?: number; // minutes, default 15
  minTime?: string; // "HH:mm"
  placeholder?: string;
  className?: string;
}

function generateSlots(interval: number): string[] {
  const slots: string[] = [];
  for (let m = 0; m < 24 * 60; m += interval) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function TimePicker({
  value,
  onChange,
  interval = 15,
  minTime,
  placeholder = "Select a time",
  className = "",
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrapperRef, close);

  const slots = useMemo(() => generateSlots(interval), [interval]);
  const minMinutes = minTime ? timeToMinutes(minTime) : -1;

  // Auto-scroll to selected or nearest slot when opening
  useEffect(() => {
    if (open && listRef.current) {
      if (selectedRef.current) {
        selectedRef.current.scrollIntoView({ block: "center" });
      } else {
        // Scroll to nearest future time
        const now = timeToMinutes(
          value || `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`
        );
        const idx = slots.findIndex((s) => timeToMinutes(s) >= now);
        if (idx >= 0) {
          const el = listRef.current.children[idx] as HTMLElement;
          el?.scrollIntoView({ block: "center" });
        }
      }
    }
  }, [open, value, slots]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }

  // Format for display: 9:00 AM style
  const displayValue = value
    ? (() => {
        const [h, m] = value.split(":").map(Number);
        const suffix = h >= 12 ? "PM" : "AM";
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
      })()
    : "";

  function formatSlot(slot: string): string {
    const [h, m] = slot.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
  }

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
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-border-subtle bg-surface-primary shadow-lg py-1 animate-in fade-in-0 zoom-in-95"
        >
          {slots.map((slot) => {
            const disabled = timeToMinutes(slot) < minMinutes;
            const isSelected = slot === value;

            return (
              <button
                key={slot}
                ref={isSelected ? selectedRef : undefined}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onChange(slot);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                  isSelected
                    ? "bg-accent-gold-pale text-accent-gold font-medium"
                    : disabled
                    ? "text-text-tertiary opacity-40 cursor-not-allowed"
                    : "text-text-primary hover:bg-surface-tertiary"
                }`}
              >
                {formatSlot(slot)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
