"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { enUS, fr, es, it, de } from "date-fns/locale";
import {
  Button,
  TextInput,
  TextArea,
  Select,
  Heading,
  DatePicker,
  TimePicker,
} from "@community/ui";
import { useAgents } from "@/requests/useAgents";
import { useScheduleMeeting } from "@/requests/useMeetings";
import { useCreateRecurringActivity } from "@/requests/useRecurringActivities";
import RecurrenceForm, { type RecurrenceRule } from "./recurrence-form";

interface MeetingScheduleFormProps {
  defaultTimezone?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DURATION_OPTIONS = [
  { value: "5", label: "5 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Berlin", label: "Europe/Berlin" },
  { value: "Europe/Rome", label: "Europe/Rome" },
  { value: "Europe/Madrid", label: "Europe/Madrid" },
  { value: "America/New_York", label: "America/New York" },
  { value: "America/Chicago", label: "America/Chicago" },
  { value: "America/Denver", label: "America/Denver" },
  { value: "America/Los_Angeles", label: "America/Los Angeles" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai" },
];

const LOCALE_MAP: Record<string, typeof enUS> = { en: enUS, fr, es, it, de };

export default function MeetingScheduleForm({
  defaultTimezone,
  onSuccess,
  onCancel,
}: MeetingScheduleFormProps) {
  const t = useTranslations("meetings");
  const locale = useLocale();
  const dateFnsLocale = LOCALE_MAP[locale] || enUS;
  const { data: agents = [] } = useAgents();
  const scheduleMeeting = useScheduleMeeting();
  const createRecurring = useCreateRecurringActivity();

  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [timezone, setTimezone] = useState(
    defaultTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>({
    frequency: "weekly",
    interval: 1,
    daysOfWeek: [],
    endCondition: "never",
  });

  // When the selected date is today, compute minTime from current time
  const minTime = useMemo(() => {
    if (!selectedDate) return undefined;
    const now = new Date();
    const isToday =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();
    if (!isToday) return undefined;
    // Round up to next 15-min interval
    const m = now.getHours() * 60 + now.getMinutes();
    const next = Math.ceil(m / 15) * 15;
    const hh = String(Math.floor(next / 60)).padStart(2, "0");
    const mm = String(next % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }, [selectedDate]);

  function toggleAgent(agentId: string) {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !agenda || !selectedDate) return;

    if (isRecurring) {
      const startDate = selectedDate.toISOString().split("T")[0];
      await createRecurring.mutateAsync({
        activity_type: "meeting",
        title,
        description: agenda,
        payload: {
          participant_agent_ids: selectedAgents,
          agenda,
          duration_minutes: parseInt(durationMinutes, 10),
          timezone,
        },
        frequency: recurrenceRule.frequency,
        interval: recurrenceRule.interval,
        days_of_week: recurrenceRule.frequency === "weekly" ? recurrenceRule.daysOfWeek : undefined,
        day_of_month: recurrenceRule.frequency === "monthly" ? recurrenceRule.dayOfMonth : undefined,
        time_of_day: selectedTime,
        timezone,
        start_date: startDate,
        end_after_occurrences:
          recurrenceRule.endCondition === "after" ? recurrenceRule.endAfterOccurrences : undefined,
        end_by_date:
          recurrenceRule.endCondition === "by_date" && recurrenceRule.endByDate
            ? recurrenceRule.endByDate.toISOString().split("T")[0]
            : undefined,
      });
    } else {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      await scheduleMeeting.mutateAsync({
        title,
        agenda,
        participant_agent_ids: selectedAgents,
        scheduled_at: scheduledDate.toISOString(),
        duration_minutes: parseInt(durationMinutes, 10),
        timezone,
      });
    }

    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Heading as="h3" className="text-lg">
        {t("scheduleForm.title")}
      </Heading>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {t("scheduleForm.titleLabel")}
        </label>
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("scheduleForm.titlePlaceholder")}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {t("scheduleForm.agendaLabel")}
        </label>
        <TextArea
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
          placeholder={t("scheduleForm.agendaPlaceholder")}
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {t("scheduleForm.participantsLabel")}
        </label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
          <label className="flex items-center gap-2 p-1.5 rounded bg-bg-secondary opacity-75 cursor-not-allowed">
            <input type="checkbox" checked disabled className="rounded border-border" />
            <span className="text-sm text-text-primary">{t("scheduleForm.supervisor")}</span>
            <span className="text-xs text-text-tertiary">{t("scheduleForm.supervisorNote")}</span>
          </label>
          {agents.length === 0 && (
            <p className="text-sm text-text-tertiary py-2 text-center">
              {t("scheduleForm.noAgents")}
            </p>
          )}
          {agents.map((agent) => (
            <label
              key={agent.id}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-bg-secondary cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedAgents.includes(agent.id)}
                onChange={() => toggleAgent(agent.id)}
                className="rounded border-border"
              />
              <span className="text-sm text-text-primary">{agent.name}</span>
              {agent.description && (
                <span className="text-xs text-text-tertiary truncate">
                  — {agent.description}
                </span>
              )}
            </label>
          ))}
        </div>
        {selectedAgents.length >= 1 && (
          <p className="text-xs text-text-tertiary mt-1">
            {selectedAgents.length} {t("scheduleForm.selected")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t("scheduleForm.dateLabel")}
          </label>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            placeholder={t("scheduleForm.datePlaceholder")}
            locale={dateFnsLocale}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t("scheduleForm.timeLabel")}
          </label>
          <TimePicker
            value={selectedTime}
            onChange={setSelectedTime}
            minTime={minTime}
            placeholder={t("scheduleForm.timePlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t("scheduleForm.durationLabel")}
          </label>
          <Select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            options={DURATION_OPTIONS}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {t("scheduleForm.timezoneLabel")}
        </label>
        <Select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          options={TIMEZONE_OPTIONS}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-sm font-medium text-text-secondary">
            {t("scheduleForm.repeat")}
          </span>
        </label>
      </div>

      {isRecurring && (
        <RecurrenceForm value={recurrenceRule} onChange={setRecurrenceRule} />
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={
            (scheduleMeeting.isPending || createRecurring.isPending) ||
            !title ||
            !agenda ||
            !selectedDate
          }
        >
          {(scheduleMeeting.isPending || createRecurring.isPending)
            ? t("scheduleForm.scheduling")
            : isRecurring
              ? t("scheduleForm.submitRecurring")
              : t("scheduleForm.submit")}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("scheduleForm.cancel")}
          </Button>
        )}
      </div>

      {(scheduleMeeting.isError || createRecurring.isError) && (
        <p className="text-sm text-red-500">{t("scheduleForm.error")}</p>
      )}
    </form>
  );
}
