import { registerTool } from "../registry";
import { sendNotificationTool } from "./send-notification";
import { scheduleNotificationTool } from "./schedule-notification";

export const notificationToolDefinitions = [sendNotificationTool, scheduleNotificationTool];

for (const def of notificationToolDefinitions) {
  registerTool(def);
}
