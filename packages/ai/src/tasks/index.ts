export { titleGeneration } from "./titleGeneration";
export { activityExecution } from "./activityExecution";
export { activityCron, meetingStart } from "./meetingStart";
export { meetingRound } from "./meetingRound";
export { meetingClosing } from "./meetingClosing";
export { meetingSummary } from "./meetingSummary";
export { notificationExecution } from "./notificationExecution";

import { titleGeneration } from "./titleGeneration";
import { activityExecution } from "./activityExecution";
import { activityCron, meetingStart } from "./meetingStart";
import { meetingRound } from "./meetingRound";
import { meetingClosing } from "./meetingClosing";
import { meetingSummary } from "./meetingSummary";
import { notificationExecution } from "./notificationExecution";

export const allFunctions = [
  titleGeneration,
  activityExecution,
  activityCron,
  meetingStart,
  meetingRound,
  meetingClosing,
  meetingSummary,
  notificationExecution,
];
