import type { AuditLogRepository } from "../repositories/auditLogRepository";

export class AuditLogService {
  constructor(private repository: AuditLogRepository) {}

  /**
   * Log an audit event. Should always be called fire-and-forget:
   * auditLogService.log(...).catch(() => {});
   */
  async log(
    userId: string,
    eventType: string,
    entityType: string,
    entityId: string | null,
    details: Record<string, unknown> = {}
  ) {
    return this.repository.create({
      eventType,
      entityType,
      entityId,
      userId,
      details,
    });
  }

  async getByUserId(
    userId: string,
    filters?: {
      eventType?: string;
      entityType?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    return this.repository.findByUserId(userId, filters);
  }

  async getByEntity(entityType: string, entityId: string) {
    return this.repository.findByEntity(entityType, entityId);
  }
}
