import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AddCoachDto } from './dto/add-coach.dto.js';
import { AddScheduleDto } from './dto/add-schedule.dto.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import {
  ScheduleResponseDto,
  TeamCoachResponseDto,
  TeamResponseDto,
} from './dto/team-response.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';

const teamInclude = {
  coaches: {
    include: {
      user: {
        select: { id: true, fullName: true, email: true },
      },
    },
  },
  teamSchedules: {
    include: {
      field: {
        select: { id: true, name: true, location: true },
      },
    },
  },
} as const;

type TeamWithRelations = Prisma.TeamGetPayload<{ include: typeof teamInclude }>;

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapTeam(team: TeamWithRelations): TeamResponseDto {
    return {
      id: team.id,
      academyId: team.academyId,
      name: team.name,
      category: team.category,
      isActive: team.isActive,
      createdAt: team.createdAt,
      coaches: team.coaches,
      schedules: team.teamSchedules,
    };
  }

  async create(academyId: string, dto: CreateTeamDto): Promise<TeamResponseDto> {
    const duplicate = await this.prisma.team.findFirst({
      where: { academyId, name: dto.name, isActive: true },
    });
    if (duplicate) {
      throw new ConflictException('Ya existe un equipo con ese nombre en la academia');
    }

    if (dto.coaches && dto.coaches.length > 0) {
      const userIds = dto.coaches.map((c) => c.userId);
      if (new Set(userIds).size !== userIds.length) {
        throw new ConflictException('No se pueden asignar coaches duplicados al equipo');
      }
      for (const coachEntry of dto.coaches) {
        const coachRole = await this.prisma.userAcademyRole.findFirst({
          where: { userId: coachEntry.userId, academyId, role: Role.coach, isActive: true },
        });
        if (!coachRole) {
          throw new NotFoundException('El usuario no es un coach de esta academia');
        }
      }
    }

    if (dto.schedules && dto.schedules.length > 0) {
      const days = dto.schedules.map((s) => s.dayOfWeek);
      if (new Set(days).size !== days.length) {
        throw new ConflictException('El equipo ya tiene un horario asignado para ese día');
      }
      for (const scheduleEntry of dto.schedules) {
        if (timeToMinutes(scheduleEntry.endTime) <= timeToMinutes(scheduleEntry.startTime)) {
          throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio');
        }
        const field = await this.prisma.field.findFirst({
          where: { id: scheduleEntry.fieldId, academyId, isActive: true },
        });
        if (!field) {
          throw new NotFoundException('La cancha no existe o no pertenece a esta academia');
        }
      }
    }

    const team = await this.prisma.team.create({
      data: {
        academyId,
        name: dto.name,
        category: dto.category,
        coaches:
          dto.coaches && dto.coaches.length > 0
            ? {
                create: dto.coaches.map((c) => ({
                  userId: c.userId,
                  isPrimary: c.isPrimary ?? false,
                })),
              }
            : undefined,
        teamSchedules:
          dto.schedules && dto.schedules.length > 0
            ? {
                create: dto.schedules.map((s) => ({
                  fieldId: s.fieldId,
                  dayOfWeek: s.dayOfWeek,
                  startTime: s.startTime,
                  endTime: s.endTime,
                })),
              }
            : undefined,
      },
      include: teamInclude,
    });

    return this.mapTeam(team);
  }

  async findAll(academyId: string, userId: string, role: Role): Promise<TeamResponseDto[]> {
    const where: Prisma.TeamWhereInput = {
      academyId,
      isActive: true,
      ...(role === Role.coach && { coaches: { some: { userId } } }),
    };

    const teams = await this.prisma.team.findMany({
      where,
      orderBy: { name: 'asc' },
      include: teamInclude,
    });

    return teams.map((t) => this.mapTeam(t));
  }

  async findOne(
    academyId: string,
    userId: string,
    role: Role,
    id: string,
  ): Promise<TeamResponseDto> {
    const where: Prisma.TeamWhereInput = {
      id,
      academyId,
      ...(role === Role.coach && { coaches: { some: { userId } } }),
    };

    const team = await this.prisma.team.findFirst({
      where,
      include: teamInclude,
    });

    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    return this.mapTeam(team);
  }

  async update(academyId: string, id: string, dto: UpdateTeamDto): Promise<TeamResponseDto> {
    const team = await this.prisma.team.findFirst({
      where: { id, academyId },
    });
    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    if (dto.name && dto.name !== team.name) {
      const duplicate = await this.prisma.team.findFirst({
        where: { academyId, name: dto.name, isActive: true, NOT: { id } },
      });
      if (duplicate) {
        throw new ConflictException('Ya existe un equipo con ese nombre en la academia');
      }
    }

    const updated = await this.prisma.team.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.category !== undefined && { category: dto.category }),
      },
      include: teamInclude,
    });

    return this.mapTeam(updated);
  }

  async remove(academyId: string, id: string): Promise<void> {
    const team = await this.prisma.team.findFirst({
      where: { id, academyId },
    });
    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const activePlayers = await this.prisma.player.count({
      where: { teamId: id, isActive: true },
    });
    if (activePlayers > 0) {
      throw new BadRequestException(
        'No se puede eliminar un equipo que tiene jugadores activos. Reasigna los jugadores primero.',
      );
    }

    await this.prisma.team.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addCoach(
    academyId: string,
    teamId: string,
    dto: AddCoachDto,
  ): Promise<TeamCoachResponseDto> {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, academyId },
    });
    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const coachRole = await this.prisma.userAcademyRole.findFirst({
      where: { userId: dto.userId, academyId, role: Role.coach, isActive: true },
    });
    if (!coachRole) {
      throw new NotFoundException('El usuario no es un coach de esta academia');
    }

    const existing = await this.prisma.teamCoach.findFirst({
      where: { teamId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('Este coach ya está asignado a este equipo');
    }

    const isPrimary = dto.isPrimary ?? false;

    if (isPrimary) {
      await this.prisma.teamCoach.updateMany({
        where: { teamId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.teamCoach.create({
      data: { teamId, userId: dto.userId, isPrimary },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async removeCoach(academyId: string, teamId: string, userId: string): Promise<void> {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, academyId },
    });
    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const teamCoach = await this.prisma.teamCoach.findFirst({
      where: { teamId, userId },
    });
    if (!teamCoach) {
      throw new NotFoundException('El coach no está asignado a este equipo');
    }

    await this.prisma.teamCoach.delete({
      where: { id: teamCoach.id },
    });
  }

  async addSchedule(
    academyId: string,
    teamId: string,
    dto: AddScheduleDto,
  ): Promise<ScheduleResponseDto> {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, academyId },
    });
    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const field = await this.prisma.field.findFirst({
      where: { id: dto.fieldId, academyId, isActive: true },
    });
    if (!field) {
      throw new NotFoundException('La cancha no existe o no pertenece a esta academia');
    }

    if (timeToMinutes(dto.endTime) <= timeToMinutes(dto.startTime)) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio');
    }

    const duplicate = await this.prisma.teamSchedule.findFirst({
      where: { teamId, dayOfWeek: dto.dayOfWeek },
    });
    if (duplicate) {
      throw new ConflictException('El equipo ya tiene un horario asignado para ese día');
    }

    return this.prisma.teamSchedule.create({
      data: {
        teamId,
        fieldId: dto.fieldId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
      include: {
        field: { select: { id: true, name: true, location: true } },
      },
    });
  }

  async removeSchedule(academyId: string, teamId: string, scheduleId: string): Promise<void> {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, academyId },
    });
    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    const schedule = await this.prisma.teamSchedule.findFirst({
      where: { id: scheduleId, teamId },
    });
    if (!schedule) {
      throw new NotFoundException('Horario no encontrado');
    }

    await this.prisma.teamSchedule.delete({
      where: { id: scheduleId },
    });
  }
}
