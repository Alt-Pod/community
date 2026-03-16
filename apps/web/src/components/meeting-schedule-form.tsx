"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, TextInput, TextArea, Select, Heading } from "@community/ui";
import { useAgents } from "@/requests/useAgents";
import { useScheduleMeeting } from "@/requests/useMeetings";

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

export default function MeetingScheduleForm({
  defaultTimezone,
  onSuccess,
  onCancel,
}: MeetingScheduleFormProps) {
  const t = useTranslations("meetings");
  const { data: agents = [] } = useAgents();
  const scheduleMeeting = useScheduleMeeting();

  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [timezone, setTimezone] = useState(
    defaultTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );

  function toggleAgent(agentId: string) {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !agenda || selectedAgents.length < 2 || !scheduledAt) return;

    await scheduleMeeting.mutateAsync({
      title,
      agenda,
      participant_agent_ids: selectedAgents,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: parseInt(durationMinutes, 10),
      timezone,
    });

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
        {selectedAgents.length > 0 && selectedAgents.length < 2 && (
          <p className="text-xs text-red-500 mt-1">
            {t("scheduleForm.minAgents")}
          </p>
        )}
        {selectedAgents.length >= 2 && (
          <p className="text-xs text-text-tertiary mt-1">
            {selectedAgents.length} {t("scheduleForm.selected")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t("scheduleForm.dateLabel")}
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary"
            required
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

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={
            scheduleMeeting.isPending ||
            !title ||
            !agenda ||
            selectedAgents.length < 2 ||
            !scheduledAt
          }
        >
          {scheduleMeeting.isPending
            ? t("scheduleForm.scheduling")
            : t("scheduleForm.submit")}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("scheduleForm.cancel")}
          </Button>
        )}
      </div>

      {scheduleMeeting.isError && (
        <p className="text-sm text-red-500">{t("scheduleForm.error")}</p>
      )}
    </form>
  );
}
