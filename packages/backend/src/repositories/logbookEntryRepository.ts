import type { Sql, JSONValue } from "postgres";
import type { LogbookEntry, LogbookEvent } from "@community/shared";

export class LogbookEntryRepository {
  constructor(
    private sql: Sql,
    private table: string = "logbook_entries"
  ) {}

  async findByUserAndDate(
    userId: string,
    date: string
  ): Promise<LogbookEntry | undefined> {
    const [entry] = await this.sql<LogbookEntry[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE user_id = ${userId} AND entry_date = ${date}
    `;
    return entry;
  }

  async findByUserId(
    userId: string,
    filters?: { limit?: number; offset?: number }
  ): Promise<LogbookEntry[]> {
    const limit = filters?.limit ?? 30;
    const offset = filters?.offset ?? 0;

    return this.sql<LogbookEntry[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY entry_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  async findLatest(userId: string): Promise<LogbookEntry | undefined> {
    const [entry] = await this.sql<LogbookEntry[]>`
      SELECT * FROM ${this.sql(this.table)}
      WHERE user_id = ${userId}
      ORDER BY entry_date DESC
      LIMIT 1
    `;
    return entry;
  }

  async upsert(
    userId: string,
    date: string,
    content: string,
    eventsSummary: LogbookEvent[],
    version: number
  ): Promise<LogbookEntry> {
    const [entry] = await this.sql<LogbookEntry[]>`
      INSERT INTO ${this.sql(this.table)} (user_id, entry_date, content, events_summary, version, last_enriched_at)
      VALUES (
        ${userId},
        ${date},
        ${content},
        ${this.sql.json(eventsSummary as unknown as JSONValue)},
        ${version},
        now()
      )
      ON CONFLICT (user_id, entry_date) DO UPDATE SET
        content = EXCLUDED.content,
        events_summary = EXCLUDED.events_summary,
        version = EXCLUDED.version,
        last_enriched_at = now(),
        updated_at = now()
      RETURNING *
    `;
    return entry;
  }
}
