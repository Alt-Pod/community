export interface ToolDefinition {
  id: string;
  category: string;
  name: string;
  description: string;
  requiresConfirmation: boolean;
}

export type ToolExecutionStatus =
  | "pending"
  | "awaiting-confirmation"
  | "executing"
  | "completed"
  | "failed"
  | "rejected";
