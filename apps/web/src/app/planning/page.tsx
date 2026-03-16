"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button, Heading, LoadingIndicator, Select, Card } from "@community/ui";
import { useScheduledActivities } from "@/requests/useScheduledActivities";
import { useAgents } from "@/requests/useAgents";
import { useProfile } from "@/requests/useProfile";
import PlanningCalendar from "@/components/planning-calendar";
import ScheduledActivityList from "@/components/scheduled-activity-list";
import MeetingScheduleForm from "@/components/meeting-schedule-form";

export default function PlanningPage() {
  const t = useTranslations("planning");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [agentFilter, setAgentFilter] = useState<string>("");
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const { data: profile } = useProfile();

  const from = new Date(year, month, 1).toISOString();
  const to = new Date(year, month + 1, 1).toISOString();

  const { data: activities = [], isLoading: activitiesLoading } = useScheduledActivities(
    from,
    to,
    agentFilter || undefined
  );
  const { data: agents = [], isLoading: agentsLoading } = useAgents();

  const agentNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of agents) {
      map[a.id] = a.name;
    }
    return map;
  }, [agents]);

  const selectedDayActivities = useMemo(() => {
    if (selectedDay === null) return [];
    return activities.filter((a) => {
      const d = new Date(a.scheduled_at);
      return d.getDate() === selectedDay;
    });
  }, [activities, selectedDay]);

  const monthLabel = new Date(year, month).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function goToPrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(null);
  }

  function goToNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(null);
  }

  function goToToday() {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today.getDate());
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex items-center justify-between mb-8">
        <Heading as="h1" className="text-2xl">
          {t("title")}
        </Heading>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowMeetingForm(!showMeetingForm)}>
            {showMeetingForm ? t("hideMeetingForm") : t("scheduleMeeting")}
          </Button>
          <Select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            options={[
              { value: "", label: t("calendar.allAgents") },
              ...agents.map((agent) => ({
                value: agent.id,
                label: agent.name,
              })),
            ]}
          />
        </div>
      </div>

      {showMeetingForm && (
        <div className="mb-6">
          <Card>
            <MeetingScheduleForm
              defaultTimezone={profile?.timezone}
              onSuccess={() => setShowMeetingForm(false)}
              onCancel={() => setShowMeetingForm(false)}
            />
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={goToPrevMonth}>
            {t("calendar.previousMonth")}
          </Button>
          <Button variant="secondary" onClick={goToToday}>
            {t("calendar.today")}
          </Button>
          <Button variant="secondary" onClick={goToNextMonth}>
            {t("calendar.nextMonth")}
          </Button>
        </div>
        <Heading as="h2" className="text-lg capitalize">
          {monthLabel}
        </Heading>
      </div>

      {(activitiesLoading || agentsLoading) && (
        <LoadingIndicator variant="inline" text={t("loading")} className="mb-4" />
      )}

      <PlanningCalendar
        year={year}
        month={month}
        activities={activities}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      {selectedDay !== null && (
        <div className="mt-6">
          <Heading as="h3" className="text-base mb-3">
            {new Date(year, month, selectedDay).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Heading>
          <ScheduledActivityList
            activities={selectedDayActivities}
            agentNames={agentNames}
          />
        </div>
      )}
    </div>
  );
}
