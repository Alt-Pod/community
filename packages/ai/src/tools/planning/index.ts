import { registerTool } from "../registry";
import { scheduleActivityTool } from "./schedule-activity";
import { listScheduledActivitiesTool } from "./list-scheduled-activities";
import { cancelScheduledActivityTool } from "./cancel-scheduled-activity";

export const planningToolDefinitions = [
  scheduleActivityTool,
  listScheduledActivitiesTool,
  cancelScheduledActivityTool,
];

for (const def of planningToolDefinitions) {
  registerTool(def);
}
