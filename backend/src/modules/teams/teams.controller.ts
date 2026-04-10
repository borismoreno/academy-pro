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
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { AddCoachDto } from './dto/add-coach.dto.js';
import { AddScheduleDto } from './dto/add-schedule.dto.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import {
  ScheduleResponseDto,
  TeamCoachResponseDto,
  TeamResponseDto,
} from './dto/team-response.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { TeamsService } from './teams.service.js';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(Role.academy_director)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTeamDto,
  ): Promise<{ data: TeamResponseDto; message: string }> {
    const data = await this.teamsService.create(user.academyId as string, dto);
    return { data, message: 'Equipo creado exitosamente' };
  }

  @Get()
  @Roles(Role.academy_director, Role.coach)
  async findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ data: TeamResponseDto[]; message: string }> {
    const data = await this.teamsService.findAll(
      user.academyId as string,
      user.sub,
      user.role as Role,
    );
    return { data, message: 'Equipos obtenidos exitosamente' };
  }

  @Get(':id')
  @Roles(Role.academy_director, Role.coach)
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: TeamResponseDto; message: string }> {
    const data = await this.teamsService.findOne(
      user.academyId as string,
      user.sub,
      user.role as Role,
      id,
    );
    return { data, message: 'Equipo obtenido exitosamente' };
  }

  @Patch(':id')
  @Roles(Role.academy_director)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ): Promise<{ data: TeamResponseDto; message: string }> {
    const data = await this.teamsService.update(user.academyId as string, id, dto);
    return { data, message: 'Equipo actualizado exitosamente' };
  }

  @Delete(':id')
  @Roles(Role.academy_director)
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: null; message: string }> {
    await this.teamsService.remove(user.academyId as string, id);
    return { data: null, message: 'Equipo eliminado exitosamente' };
  }

  @Post(':id/coaches')
  @Roles(Role.academy_director)
  async addCoach(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddCoachDto,
  ): Promise<{ data: TeamCoachResponseDto; message: string }> {
    const data = await this.teamsService.addCoach(user.academyId as string, id, dto);
    return { data, message: 'Coach asignado exitosamente' };
  }

  @Delete(':id/coaches/:userId')
  @Roles(Role.academy_director)
  @HttpCode(HttpStatus.OK)
  async removeCoach(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<{ data: null; message: string }> {
    await this.teamsService.removeCoach(user.academyId as string, id, userId);
    return { data: null, message: 'Coach removido del equipo exitosamente' };
  }

  @Post(':id/schedules')
  @Roles(Role.academy_director)
  async addSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddScheduleDto,
  ): Promise<{ data: ScheduleResponseDto; message: string }> {
    const data = await this.teamsService.addSchedule(user.academyId as string, id, dto);
    return { data, message: 'Horario agregado exitosamente' };
  }

  @Delete(':id/schedules/:scheduleId')
  @Roles(Role.academy_director)
  @HttpCode(HttpStatus.OK)
  async removeSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
  ): Promise<{ data: null; message: string }> {
    await this.teamsService.removeSchedule(user.academyId as string, id, scheduleId);
    return { data: null, message: 'Horario eliminado exitosamente' };
  }
}
