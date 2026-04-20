import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PlanGuardService } from '../plan-guard/plan-guard.service.js';
import { AddParentDto } from './dto/add-parent.dto.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import {
  PlayerParentResponseDto,
  PlayerResponseDto,
} from './dto/player-response.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';

const playerInclude = {
  team: {
    select: { id: true, name: true, category: true },
  },
} as const;

const playerIncludeWithParents = {
  team: {
    select: { id: true, name: true, category: true },
  },
  parents: {
    include: {
      user: {
        select: { id: true, fullName: true, email: true },
      },
    },
  },
} as const;

type PlayerWithTeam = Prisma.PlayerGetPayload<{
  include: typeof playerInclude;
}>;
type PlayerWithTeamAndParents = Prisma.PlayerGetPayload<{
  include: typeof playerIncludeWithParents;
}>;

function mapPlayer(player: PlayerWithTeam): PlayerResponseDto {
  return {
    id: player.id,
    academyId: player.academyId,
    teamId: player.teamId,
    fullName: player.fullName,
    birthDate: player.birthDate,
    position: player.position,
    photoUrl: player.photoUrl,
    isActive: player.isActive,
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
    team: player.team,
    height: player.height,
    weight: player.weight,
  };
}

function mapPlayerWithParents(
  player: PlayerWithTeamAndParents,
): PlayerResponseDto {
  return {
    id: player.id,
    academyId: player.academyId,
    teamId: player.teamId,
    fullName: player.fullName,
    birthDate: player.birthDate,
    position: player.position,
    photoUrl: player.photoUrl,
    isActive: player.isActive,
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
    team: player.team,
    height: player.height,
    weight: player.weight,
    parents: player.parents as PlayerParentResponseDto[],
  };
}

@Injectable()
export class PlayersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planGuard: PlanGuardService,
  ) {}

  async create(
    academyId: string,
    userId: string,
    role: Role,
    dto: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    await this.planGuard.validateLimit(academyId, 'players');

    const team = await this.prisma.team.findFirst({
      where: { id: dto.teamId, academyId, isActive: true },
    });
    if (!team) {
      throw new NotFoundException(
        'El equipo no existe o no pertenece a esta academia',
      );
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: dto.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este equipo');
      }
    }

    const duplicate = await this.prisma.player.findFirst({
      where: { teamId: dto.teamId, fullName: dto.fullName, isActive: true },
    });
    if (duplicate) {
      throw new ConflictException(
        'Ya existe un jugador con ese nombre en este equipo',
      );
    }

    const player = await this.prisma.player.create({
      data: {
        academyId,
        teamId: dto.teamId,
        fullName: dto.fullName,
        birthDate: new Date(dto.birthDate),
        position: dto.position,
        photoUrl: dto.photoUrl,
        height: dto.height,
        weight: dto.weight,
      },
      include: playerInclude,
    });

    return mapPlayer(player);
  }

  async findAll(
    academyId: string,
    userId: string,
    role: Role,
    teamId?: string,
    position?: string,
  ): Promise<PlayerResponseDto[]> {
    const where: Prisma.PlayerWhereInput = {
      academyId,
      ...(role !== Role.academy_director && { isActive: true }),
      ...(teamId && { teamId }),
      ...(position && { position }),
      ...(role === Role.coach && {
        team: { coaches: { some: { userId } } },
      }),
      ...(role === Role.parent && {
        parents: { some: { userId } },
      }),
    };

    const players = await this.prisma.player.findMany({
      where,
      orderBy: { fullName: 'asc' },
      include: playerInclude,
    });

    return players.map(mapPlayer);
  }

  async findOne(
    academyId: string,
    userId: string,
    role: Role,
    id: string,
  ): Promise<PlayerResponseDto> {
    const player = await this.prisma.player.findFirst({
      where: { id, academyId },
      include: playerIncludeWithParents,
    });

    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: player.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este equipo');
      }
    }

    if (role === Role.parent) {
      const linked = await this.prisma.playerParent.findFirst({
        where: { playerId: id, userId },
      });
      if (!linked) {
        throw new ForbiddenException('No tienes acceso a este jugador');
      }
    }

    return mapPlayerWithParents(player);
  }

  async update(
    academyId: string,
    userId: string,
    role: Role,
    id: string,
    dto: UpdatePlayerDto,
  ): Promise<PlayerResponseDto> {
    const player = await this.prisma.player.findFirst({
      where: { id, academyId },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    if (role === Role.parent) {
      const linked = await this.prisma.playerParent.findFirst({
        where: { playerId: id, userId },
      });
      if (!linked) {
        throw new ForbiddenException('No tienes acceso a este jugador');
      }

      const hasDisallowedFields =
        dto.fullName !== undefined ||
        dto.birthDate !== undefined ||
        dto.position !== undefined ||
        dto.height !== undefined ||
        dto.weight !== undefined ||
        dto.teamId !== undefined;
      if (hasDisallowedFields) {
        throw new ForbiddenException(
          'Solo puedes actualizar la foto del jugador',
        );
      }

      const updated = await this.prisma.player.update({
        where: { id },
        data: { ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }) },
        include: playerInclude,
      });
      return mapPlayer(updated);
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: player.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este equipo');
      }
    }

    const targetTeamId = dto.teamId ?? player.teamId;

    if (dto.teamId && dto.teamId !== player.teamId) {
      const newTeam = await this.prisma.team.findFirst({
        where: { id: dto.teamId, academyId, isActive: true },
      });
      if (!newTeam) {
        throw new NotFoundException(
          'El equipo no existe o no pertenece a esta academia',
        );
      }
    }

    const newFullName = dto.fullName ?? player.fullName;
    if (dto.fullName !== undefined || dto.teamId !== undefined) {
      const duplicate = await this.prisma.player.findFirst({
        where: {
          teamId: targetTeamId,
          fullName: newFullName,
          isActive: true,
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ConflictException(
          'Ya existe un jugador con ese nombre en este equipo',
        );
      }
    }

    const updated = await this.prisma.player.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.birthDate !== undefined && {
          birthDate: new Date(dto.birthDate),
        }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.teamId !== undefined && { teamId: dto.teamId }),
        ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.height !== undefined && { height: dto.height }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
      },
      include: playerInclude,
    });

    return mapPlayer(updated);
  }

  async remove(academyId: string, id: string): Promise<void> {
    const player = await this.prisma.player.findFirst({
      where: { id, academyId },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    await this.prisma.player.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addParent(
    academyId: string,
    playerId: string,
    dto: AddParentDto,
  ): Promise<PlayerParentResponseDto> {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, academyId },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    const parentRole = await this.prisma.userAcademyRole.findFirst({
      where: {
        userId: dto.userId,
        academyId,
        role: Role.parent,
        isActive: true,
      },
    });
    if (!parentRole) {
      throw new NotFoundException(
        'El usuario no es un padre/tutor de esta academia',
      );
    }

    const existing = await this.prisma.playerParent.findFirst({
      where: { playerId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException(
        'Este padre/tutor ya está vinculado a este jugador',
      );
    }

    return this.prisma.playerParent.create({
      data: {
        playerId,
        userId: dto.userId,
        relationship: dto.relationship,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    }) as Promise<PlayerParentResponseDto>;
  }

  async removeParent(
    academyId: string,
    playerId: string,
    userId: string,
  ): Promise<void> {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, academyId },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    const link = await this.prisma.playerParent.findFirst({
      where: { playerId, userId },
    });
    if (!link) {
      throw new NotFoundException(
        'El padre/tutor no está vinculado a este jugador',
      );
    }

    await this.prisma.playerParent.delete({
      where: { id: link.id },
    });
  }
}
