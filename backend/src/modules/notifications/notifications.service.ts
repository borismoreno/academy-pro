import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationResponseDto } from './dto/notification-response.dto.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    academyId: string,
    unreadOnly: boolean,
  ): Promise<NotificationResponseDto[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        academyId,
        ...(unreadOnly && { isRead: false }),
      },
      select: {
        id: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(
    userId: string,
    academyId: string,
    id: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId, academyId },
    });
    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
      select: {
        id: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
    });
  }

  async markAllAsRead(
    userId: string,
    academyId: string,
  ): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, academyId, isRead: false },
      data: { isRead: true },
    });
    return { count: result.count };
  }

  async getUnreadCount(
    userId: string,
    academyId: string,
  ): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, academyId, isRead: false },
    });
    return { count };
  }

  async createNotification(params: {
    userId: string;
    academyId: string;
    title: string;
    message: string;
  }): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId: params.userId,
          academyId: params.academyId,
          title: params.title,
          message: params.message,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create notification', error);
    }
  }
}
