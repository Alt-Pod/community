export { titleGeneration } from "./titleGeneration";
export { activityExecution } from "./activityExecution";
export { meetingCron, meetingStart } from "./meetingStart";
export { meetingRound } from "./meetingRound";
export { meetingClosing } from "./meetingClosing";
export { meetingSummary } from "./meetingSummary";

import { titleGeneration } from "./titleGeneration";
import { activityExecution } from "./activityExecution";
import { meetingCron, meetingStart } from "./meetingStart";
import { meetingRound } from "./meetingRound";
import { meetingClosing } from "./meetingClosing";
import { meetingSummary } from "./meetingSummary";

export const allFunctions = [
  titleGeneration,
  activityExecution,
  meetingCron,
  meetingStart,
  meetingRound,
  meetingClosing,
  meetingSummary,
];
