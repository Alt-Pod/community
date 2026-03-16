"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Heading, LoadingIndicator, Select, Card } from "@community/ui";
import { useScheduledActivities } from "@/requests/useScheduledActivities";
import { useRecurringActivities } from "@/requests/useRecurringActivities";
import { useAgents } from "@/requests/useAgents";
import { useProfile } from "@/requests/useProfile";
import PlanningViewSelector from "@/components/planning-view-selector";
import type { PlanningViewMode } from "@/components/planning-view-selector";
import PlanningNavigation from "@/components/planning-navigation";
import PlanningDailyView from "@/components/planning-daily-view";
import PlanningWeeklyView from "@/components/planning-weekly-view";
import PlanningCalendar from "@/components/planning-calendar";
import MeetingScheduleForm from "@/components/meeting-schedule-form";
import RecurringActivityList from "@/components/recurring-activity-list";

function parseDate(str: string | null): Date {
  if (str) {
    const d = new Date(str + "T00:00:00");
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDateRange(
  view: PlanningViewMode,
  date: Date
): { from: string; to: string } {
  switch (view) {
    case "daily": {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    case "weekly": {
      const monday = getWeekStart(date);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 7);
      return { from: monday.toISOString(), to: sunday.toISOString() };
    }
    case "monthly": {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      return { from: start.toISOString(), to: end.toISOString() };
    }
  }
}

export default function PlanningPage() {
  const t = useTranslations("planning");
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = (searchParams.get("view") as PlanningViewMode) || "daily";
  const currentDate = parseDate(searchParams.get("date"));

  const [agentFilter, setAgentFilter] = useState<string>("");
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const { data: profile } = useProfile();

  const { from, to } = getDateRange(view, currentDate);

  const { data: allActivities = [], isLoading: activitiesLoading } =
    useScheduledActivities(from, to, agentFilter || undefined);
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: recurringActivities = [] } = useRecurringActivities();
  const activeRecurring = useMemo(
    () => recurringActivities.filter((r) => r.status !== "deleted"),
    [recurringActivities]
  );

  const activities = useMemo(
    () => allActivities.filter((a) => a.status !== "cancelled"),
    [allActivities]
  );

  const agentNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of agents) map[a.id] = a.name;
    return map;
  }, [agents]);

  const navigate = useCallback(
    (newView: PlanningViewMode, newDate: Date) => {
      const params = new URLSearchParams();
      params.set("view", newView);
      params.set("date", toDateStr(newDate));
      router.replace(`/planning?${params.toString()}`);
    },
    [router]
  );

  const setView = useCallback(
    (v: PlanningViewMode) => navigate(v, currentDate),
    [navigate, currentDate]
  );

  const goToPrev = useCallback(() => {
    const d = new Date(currentDate);
    switch (view) {
      case "daily":
        d.setDate(d.getDate() - 1);
        break;
      case "weekly":
        d.setDate(d.getDate() - 7);
        break;
      case "monthly":
        d.setMonth(d.getMonth() - 1);
        break;
    }
    navigate(view, d);
  }, [view, currentDate, navigate]);

  const goToNext = useCallback(() => {
    const d = new Date(currentDate);
    switch (view) {
      case "daily":
        d.setDate(d.getDate() + 1);
        break;
      case "weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "monthly":
        d.setMonth(d.getMonth() + 1);
        break;
    }
    navigate(view, d);
  }, [view, currentDate, navigate]);

  const goToToday = useCallback(() => {
    navigate(view, new Date());
  }, [view, navigate]);

  // Monthly calendar: clicking a day drills into daily view
  const handleMonthDaySelect = useCallback(
    (day: number) => {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      navigate("daily", d);
    },
    [currentDate, navigate]
  );

  // Weekly view: clicking a day header drills into daily view
  const handleWeekDaySelect = useCallback(
    (date: Date) => {
      navigate("daily", date);
    },
    [navigate]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Meeting form */}
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

      {/* View selector + Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <PlanningViewSelector value={view} onChange={setView} />
      </div>
      <div className="mb-6">
        <PlanningNavigation
          view={view}
          currentDate={currentDate}
          onPrev={goToPrev}
          onNext={goToNext}
          onToday={goToToday}
        />
      </div>

      {/* Loading */}
      {(activitiesLoading || agentsLoading) && (
        <LoadingIndicator variant="inline" text={t("loading")} className="mb-4" />
      )}

      {/* Active view */}
      {view === "daily" && (
        <PlanningDailyView
          date={currentDate}
          activities={activities}
          agentNames={agentNames}
        />
      )}

      {view === "weekly" && (
        <PlanningWeeklyView
          weekStart={getWeekStart(currentDate)}
          activities={activities}
          agentNames={agentNames}
          onSelectDay={handleWeekDaySelect}
        />
      )}

      {view === "monthly" && (
        <PlanningCalendar
          year={currentDate.getFullYear()}
          month={currentDate.getMonth()}
          activities={activities}
          selectedDay={null}
          onSelectDay={handleMonthDaySelect}
        />
      )}

      {/* Recurring Activities */}
      {activeRecurring.length > 0 && (
        <div className="mt-10">
          <Heading as="h2" className="text-lg mb-4">
            {t("recurringActivities.title")}
          </Heading>
          <RecurringActivityList activities={activeRecurring} />
        </div>
      )}
    </div>
  );
}
