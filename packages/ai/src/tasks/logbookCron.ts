import { inngest, userRepository, logbookService } from "@community/backend";
import { collectEventsForUser, generateLogbookEntry } from "./logbookHelper";
import { INNGEST_FUNCTION_IDS } from "@community/shared";

/**
 * Cron: runs every 4 hours, enriches the daily logbook entry for each user.
 * Collects events since the last enrichment and uses AI to update the entry.
 */
export const logbookCron = inngest.createFunction(
  { id: INNGEST_FUNCTION_IDS.LOGBOOK_CRON },
  { cron: "0 */4 * * *" },
  async ({ step }) => {
    const users = await step.run("find-all-users", async () => {
      const rows = await userRepository.findAll();
      return rows.map((u) => ({ id: u.id as string }));
    });

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      const result = await step.run(`logbook-${user.id}`, async () => {
        const today = new Date().toISOString().slice(0, 10);
        const existing = await logbookService.getByDate(user.id, today);

        // Determine the "since" timestamp
        const since = existing?.last_enriched_at
          ? new Date(existing.last_enriched_at)
          : new Date(today + "T00:00:00.000Z");

        const { events, summary } = await collectEventsForUser(user.id, since);

        if (events.length === 0) {
          return { skipped: true };
        }

        const content = await generateLogbookEntry(
          existing?.content ?? null,
          summary
        );

        const allEvents = [...(existing?.events_summary ?? []), ...events];
        const newVersion = (existing?.version ?? 0) + 1;

        await logbookService.upsertEntry(
          user.id,
          today,
          content,
          allEvents,
          newVersion
        );

        return { skipped: false, eventsCount: events.length };
      });

      if (result.skipped) {
        skipped++;
      } else {
        updated++;
      }
    }

    return { updated, skipped, totalUsers: users.length };
  }
);
