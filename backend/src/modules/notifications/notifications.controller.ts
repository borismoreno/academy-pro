import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { NotificationResponseDto } from './dto/notification-response.dto.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('unreadOnly') unreadOnly?: string,
  ): Promise<{ data: NotificationResponseDto[]; message: string }> {
    const data = await this.notificationsService.findAll(
      user.sub,
      user.academyId as string,
      unreadOnly === 'true',
    );
    return { data, message: 'Notificaciones obtenidas exitosamente' };
  }

  @Get('unread-count')
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async getUnreadCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ data: { count: number }; message: string }> {
    const data = await this.notificationsService.getUnreadCount(
      user.sub,
      user.academyId as string,
    );
    return { data, message: 'Conteo de notificaciones no leídas obtenido exitosamente' };
  }

  @Patch('read-all')
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async markAllAsRead(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ data: null; message: string }> {
    const { count } = await this.notificationsService.markAllAsRead(
      user.sub,
      user.academyId as string,
    );
    return {
      data: null,
      message: `Se marcaron ${count} notificaciones como leídas`,
    };
  }

  @Patch(':id/read')
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async markAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: NotificationResponseDto; message: string }> {
    const data = await this.notificationsService.markAsRead(
      user.sub,
      user.academyId as string,
      id,
    );
    return { data, message: 'Notificación marcada como leída' };
  }
}
