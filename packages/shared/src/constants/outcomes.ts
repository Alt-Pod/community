export const ACTIVITY_OUTCOME_TYPES = {
  GOAL_REACHED: "goal_reached",
  NEEDS_USER_INPUT: "needs_user_input",
  NEEDS_FOLLOW_UP: "needs_follow_up",
} as const;

export type ActivityOutcomeType =
  (typeof ACTIVITY_OUTCOME_TYPES)[keyof typeof ACTIVITY_OUTCOME_TYPES];
