import type { LogbookEntry, LogbookEvent } from "@community/shared";
import type { LogbookEntryRepository } from "../repositories/logbookEntryRepository";

export class LogbookService {
  constructor(private logbookEntryRepository: LogbookEntryRepository) {}

  async getToday(userId: string): Promise<LogbookEntry | undefined> {
    const today = new Date().toISOString().slice(0, 10);
    return this.logbookEntryRepository.findByUserAndDate(userId, today);
  }

  async getByDate(
    userId: string,
    date: string
  ): Promise<LogbookEntry | undefined> {
    return this.logbookEntryRepository.findByUserAndDate(userId, date);
  }

  async list(
    userId: string,
    filters?: { limit?: number; offset?: number }
  ): Promise<LogbookEntry[]> {
    return this.logbookEntryRepository.findByUserId(userId, filters);
  }

  async upsertEntry(
    userId: string,
    date: string,
    content: string,
    events: LogbookEvent[],
    version: number
  ): Promise<LogbookEntry> {
    return this.logbookEntryRepository.upsert(
      userId,
      date,
      content,
      events,
      version
    );
  }
}
