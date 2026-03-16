import { registerTool } from "../registry";
import { sendNotificationTool } from "./send-notification";

export const notificationToolDefinitions = [sendNotificationTool];

for (const def of notificationToolDefinitions) {
  registerTool(def);
}
