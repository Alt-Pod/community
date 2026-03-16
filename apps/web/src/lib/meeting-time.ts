import type { ScheduledActivity, MeetingPayload } from "@community/shared";

export interface EffectiveMeetingTimes {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  scheduledDurationMinutes: number;
  isActual: boolean;
}

export function getEffectiveMeetingTimes(
  activity: ScheduledActivity
): EffectiveMeetingTimes {
  const payload = activity.payload as unknown as MeetingPayload | undefined;
  const scheduledDuration = payload?.duration_minutes ?? 30;
  const scheduledAt = new Date(activity.scheduled_at);
  const scheduledEnd = new Date(
    scheduledAt.getTime() + scheduledDuration * 60_000
  );

  if (activity.status === "completed" && activity.completed_at) {
    const completedAt = new Date(activity.completed_at);
    const actualDuration = Math.round(
      (completedAt.getTime() - scheduledAt.getTime()) / 60_000
    );
    return {
      startTime: scheduledAt,
      endTime: completedAt,
      durationMinutes: Math.max(1, actualDuration),
      scheduledDurationMinutes: scheduledDuration,
      isActual: true,
    };
  }

  return {
    startTime: scheduledAt,
    endTime: scheduledEnd,
    durationMinutes: scheduledDuration,
    scheduledDurationMinutes: scheduledDuration,
    isActual: false,
  };
}
