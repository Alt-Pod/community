import { registerTool } from "../registry";
import { scheduleActivityTool } from "./schedule-activity";
import { listScheduledActivitiesTool } from "./list-scheduled-activities";
import { cancelScheduledActivityTool } from "./cancel-scheduled-activity";
import { scheduleMeetingTool } from "./schedule-meeting";

export const planningToolDefinitions = [
  scheduleActivityTool,
  listScheduledActivitiesTool,
  cancelScheduledActivityTool,
  scheduleMeetingTool,
];

for (const def of planningToolDefinitions) {
  registerTool(def);
}
