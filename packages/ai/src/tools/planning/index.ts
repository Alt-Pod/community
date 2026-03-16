import { registerTool } from "../registry";
import { scheduleActivityTool } from "./schedule-activity";
import { listScheduledActivitiesTool } from "./list-scheduled-activities";
import { cancelScheduledActivityTool } from "./cancel-scheduled-activity";
import { scheduleMeetingTool } from "./schedule-meeting";
import { createRecurringActivityTool } from "./create-recurring-activity";
import { updateRecurringActivityTool } from "./update-recurring-activity";
import { deleteRecurringActivityTool } from "./delete-recurring-activity";
import { listRecurringActivitiesTool } from "./list-recurring-activities";

export const planningToolDefinitions = [
  scheduleActivityTool,
  listScheduledActivitiesTool,
  cancelScheduledActivityTool,
  scheduleMeetingTool,
  createRecurringActivityTool,
  updateRecurringActivityTool,
  deleteRecurringActivityTool,
  listRecurringActivitiesTool,
];

for (const def of planningToolDefinitions) {
  registerTool(def);
}
