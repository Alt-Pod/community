import type { Notification } from "@community/shared";
import type { NotificationRepository } from "../repositories/notificationRepository";
import type { PushSubscriptionRepository } from "../repositories/pushSubscriptionRepository";
import { sendPushToUser } from "../helpers/pushHelper";

export class NotificationService {
  constructor(
    private notificationRepository: NotificationRepository,
    private pushSubscriptionRepository: PushSubscriptionRepository
  ) {}

  async create(
    userId: string,
    data: {
      title: string;
      body: string;
      type?: string;
      link?: string | null;
      agentId?: string | null;
      conversationId?: string | null;
      metadata?: Record<string, unknown>;
    }
  ): Promise<Notification> {
    const notification = await this.notificationRepository.create({
      userId,
      ...data,
    });

    // Fire-and-forget push notification
    sendPushToUser(this.pushSubscriptionRepository, userId, {
      title: data.title,
      body: data.body,
      link: data.link,
    }).catch(() => {});

    return notification;
  }

  async list(
    userId: string,
    filters?: { unreadOnly?: boolean; limit?: number; offset?: number }
  ): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId, filters);
  }

  async markRead(id: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationRepository.markRead(id, userId);
    return notification ?? null;
  }

  async markAllRead(userId: string): Promise<number> {
    return this.notificationRepository.markAllRead(userId);
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const notification = await this.notificationRepository.deleteById(id, userId);
    return !!notification;
  }
}
