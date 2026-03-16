export type { ActivityOutcomeType } from "../constants/outcomes";
import type { ActivityOutcomeType } from "../constants/outcomes";

export interface ActivityOutcome {
  type: ActivityOutcomeType;
  summary: string;
  user_prompt?: string;
  follow_up_hint?: string;
}
