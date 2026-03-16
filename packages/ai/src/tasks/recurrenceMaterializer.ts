import {
  inngest,
  recurringActivityRepository,
  recurringActivityService,
} from "@community/backend";

/**
 * Daily cron: materializes scheduled_activity instances for all active
 * recurring activities up to 30 days in the future.
 */
export const recurrenceMaterializer = inngest.createFunction(
  { id: "recurrence-materializer" },
  { cron: "0 0 * * *" }, // daily at midnight UTC
  async ({ step }) => {
    const activeRules = await step.run("find-active-recurring", async () => {
      return recurringActivityRepository.findActive();
    });

    if (activeRules.length === 0) {
      return { processed: 0, instancesCreated: 0 };
    }

    let totalCreated = 0;

    for (const rule of activeRules) {
      const created = await step.run(`materialize-${rule.id}`, async () => {
        return recurringActivityService.materializeInstances(rule);
      });
      totalCreated += created;
    }

    return { processed: activeRules.length, instancesCreated: totalCreated };
  }
);
