import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { CronGuard } from '../../common/guards/cron.guard.js';
import { AttendanceService } from './attendance.service.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { RecordAttendanceDto } from './dto/record-attendance.dto.js';
import {
  PlayerAttendanceSummaryDto,
  SessionListResponseDto,
  SessionResponseDto,
} from './dto/session-response.dto.js';
import { UpdateSessionDto } from './dto/update-session.dto.js';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('sessions')
  @Roles(Role.academy_director, Role.coach)
  async createSession(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSessionDto,
  ): Promise<{ data: SessionResponseDto; message: string }> {
    const data = await this.attendanceService.createSession(
      user.academyId as string,
      user.sub,
      user.role as Role,
      dto,
    );
    return { data, message: 'Sesión creada exitosamente' };
  }

  @Get('sessions')
  @Roles(Role.academy_director, Role.coach)
  async findAllSessions(
    @CurrentUser() user: JwtPayload,
    @Query('teamId') teamId?: string,
    @Query('month') month?: string,
  ): Promise<{ data: SessionListResponseDto[]; message: string }> {
    const data = await this.attendanceService.findAllSessions(
      user.academyId as string,
      user.sub,
      user.role as Role,
      teamId,
      month,
    );
    return { data, message: 'Sesiones obtenidas exitosamente' };
  }

  @Get('players/:playerId/summary')
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async getPlayerSummary(
    @CurrentUser() user: JwtPayload,
    @Param('playerId') playerId: string,
    @Query('month') month?: string,
  ): Promise<{ data: PlayerAttendanceSummaryDto; message: string }> {
    const data = await this.attendanceService.getPlayerSummary(
      user.academyId as string,
      user.sub,
      user.role as Role,
      playerId,
      month,
    );
    return { data, message: 'Resumen de asistencia obtenido exitosamente' };
  }

  @Post('sessions/generate')
  @Public()
  @UseGuards(CronGuard)
  async generateSessions(): Promise<{ data: { created: number; skipped: number }; message: string }> {
    const data = await this.attendanceService.generateUpcomingSessions();
    return { data, message: 'Sesiones generadas exitosamente' };
  }

  @Get('sessions/:id')
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async findOneSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: SessionResponseDto; message: string }> {
    const data = await this.attendanceService.findOneSession(
      user.academyId as string,
      user.sub,
      user.role as Role,
      id,
    );
    return { data, message: 'Sesión obtenida exitosamente' };
  }

  @Patch('sessions/:id/records')
  @Roles(Role.academy_director, Role.coach)
  async bulkUpdateRecords(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: RecordAttendanceDto,
  ): Promise<{ data: SessionResponseDto; message: string }> {
    const data = await this.attendanceService.bulkUpdateRecords(
      user.academyId as string,
      user.sub,
      user.role as Role,
      id,
      dto,
    );
    return { data, message: 'Registros de asistencia actualizados exitosamente' };
  }

  @Patch('sessions/:id')
  @Roles(Role.academy_director, Role.coach)
  async updateSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ): Promise<{ data: SessionResponseDto; message: string }> {
    const data = await this.attendanceService.updateSession(
      user.academyId as string,
      user.sub,
      user.role as Role,
      id,
      dto,
    );
    return { data, message: 'Sesión actualizada exitosamente' };
  }

  @Delete('sessions/:id')
  @Roles(Role.academy_director, Role.coach)
  @HttpCode(HttpStatus.OK)
  async deleteSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: null; message: string }> {
    await this.attendanceService.deleteSession(
      user.academyId as string,
      user.sub,
      user.role as Role,
      id,
    );
    return { data: null, message: 'Sesión eliminada exitosamente' };
  }
}
