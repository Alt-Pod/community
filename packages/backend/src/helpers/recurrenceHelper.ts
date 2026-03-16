import type { RecurrenceFrequency } from "@community/shared";

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval_value: number;
  days_of_week: number[] | null;
  day_of_month: number | null;
  time_of_day: string; // "HH:MM" or "HH:MM:SS"
  timezone: string;
  start_date: string; // "YYYY-MM-DD"
  end_after_occurrences: number | null;
  end_by_date: string | null; // "YYYY-MM-DD"
  occurrences_created: number;
}

/**
 * Compute the next occurrences of a recurrence rule between `fromDate` and `horizon`.
 * Returns an array of UTC Date objects for each occurrence.
 */
export function computeNextOccurrences(
  rule: RecurrenceRule,
  fromDate: Date,
  horizon: Date
): Date[] {
  const results: Date[] = [];
  const maxOccurrences = rule.end_after_occurrences ?? Infinity;
  let occurrenceCount = 0;

  const endByDate = rule.end_by_date ? new Date(rule.end_by_date + "T23:59:59Z") : null;

  const [hours, minutes] = rule.time_of_day.split(":").map(Number);
  const startDate = new Date(rule.start_date + "T00:00:00Z");

  if (rule.frequency === "daily") {
    // Generate candidate dates: start_date, start_date + interval, start_date + 2*interval, ...
    const cursor = new Date(startDate);

    // Skip ahead to near fromDate to avoid iterating through many past dates
    if (cursor < fromDate && rule.interval_value > 0) {
      const diffMs = fromDate.getTime() - cursor.getTime();
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const intervalsToSkip = Math.max(0, Math.floor(diffDays / rule.interval_value) - 1);
      cursor.setUTCDate(cursor.getUTCDate() + intervalsToSkip * rule.interval_value);
      occurrenceCount += intervalsToSkip;
    }

    while (cursor <= horizon) {
      if (occurrenceCount >= maxOccurrences) break;
      if (endByDate && cursor > endByDate) break;

      const occurrence = buildOccurrenceDate(cursor, hours, minutes, rule.timezone);
      if (occurrence >= fromDate && occurrence <= horizon) {
        results.push(occurrence);
      }
      if (occurrence > horizon) break;

      occurrenceCount++;
      cursor.setUTCDate(cursor.getUTCDate() + rule.interval_value);
    }
  } else if (rule.frequency === "weekly") {
    const daysOfWeek = rule.days_of_week?.length
      ? rule.days_of_week
      : [startDate.getUTCDay()];

    const cursor = new Date(startDate);
    // Align cursor to the start of the week (Sunday)
    cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay());

    while (cursor <= horizon) {
      for (const dow of daysOfWeek.sort((a, b) => a - b)) {
        if (occurrenceCount >= maxOccurrences) break;

        const dayDate = new Date(cursor);
        dayDate.setUTCDate(dayDate.getUTCDate() + dow);

        if (dayDate < startDate) continue;
        if (endByDate && dayDate > endByDate) break;

        const occurrence = buildOccurrenceDate(dayDate, hours, minutes, rule.timezone);
        if (occurrence >= fromDate && occurrence <= horizon) {
          results.push(occurrence);
        }
        occurrenceCount++;
        if (occurrence > horizon) break;
      }

      if (occurrenceCount >= maxOccurrences) break;
      // Jump by interval_value weeks
      cursor.setUTCDate(cursor.getUTCDate() + 7 * rule.interval_value);
    }
  } else if (rule.frequency === "monthly") {
    const targetDay = rule.day_of_month ?? startDate.getUTCDate();
    const cursor = new Date(startDate);
    cursor.setUTCDate(1); // Start from the 1st of the start month

    while (cursor <= horizon) {
      if (occurrenceCount >= maxOccurrences) break;

      const year = cursor.getUTCFullYear();
      const month = cursor.getUTCMonth();
      // Clamp day to end of month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const actualDay = Math.min(targetDay, daysInMonth);

      const dayDate = new Date(Date.UTC(year, month, actualDay));

      if (dayDate >= startDate) {
        if (endByDate && dayDate > endByDate) break;

        const occurrence = buildOccurrenceDate(dayDate, hours, minutes, rule.timezone);
        if (occurrence >= fromDate && occurrence <= horizon) {
          results.push(occurrence);
        }
        occurrenceCount++;
        if (occurrence > horizon) break;
      }

      // Jump by interval_value months
      cursor.setUTCMonth(cursor.getUTCMonth() + rule.interval_value);
    }
  }

  return results;
}

/**
 * Build a UTC Date from a local date + local time + timezone.
 * E.g., date 2026-03-20, time 09:00, timezone Europe/Paris → UTC 2026-03-20T08:00:00Z
 */
function buildOccurrenceDate(
  date: Date,
  hours: number,
  minutes: number,
  timezone: string
): Date {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  // Build a local-time string in the target timezone, then figure out the UTC offset
  const localStr = `${year}-${month}-${day}T${hh}:${mm}:00`;

  // Use Intl to find the offset at this local time in the target timezone
  const utcDate = new Date(localStr + "Z");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Format the UTC date in the target timezone to see what local time it would be
  const parts = formatter.formatToParts(utcDate);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const tzHours = parseInt(get("hour"), 10);
  const tzMinutes = parseInt(get("minute"), 10);

  // The difference between UTC time and what it looks like in timezone = offset
  const utcMins = utcDate.getUTCHours() * 60 + utcDate.getUTCMinutes();
  const tzMins = tzHours * 60 + tzMinutes;
  let offsetMins = tzMins - utcMins;
  // Handle day boundary
  if (offsetMins > 720) offsetMins -= 1440;
  if (offsetMins < -720) offsetMins += 1440;

  // We want: localTime = UTC + offset → UTC = localTime - offset
  const targetUtc = new Date(localStr + "Z");
  targetUtc.setUTCMinutes(targetUtc.getUTCMinutes() - offsetMins);

  return targetUtc;
}
