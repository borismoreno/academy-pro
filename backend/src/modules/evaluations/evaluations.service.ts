import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CreateEvaluationDto } from './dto/create-evaluation.dto.js';
import { CreateMetricDto } from './dto/create-metric.dto.js';
import {
  EvaluationResponseDto,
  EvaluationScoreResponseDto,
  PlayerInfoDto,
  PlayerProgressResponseDto,
} from './dto/evaluation-response.dto.js';
import { MetricResponseDto } from './dto/metric-response.dto.js';
import { UpdateMetricDto } from './dto/update-metric.dto.js';

const evaluationInclude = {
  player: { select: { id: true, fullName: true, position: true, teamId: true } },
  coach: { select: { id: true, fullName: true } },
  scores: {
    include: {
      metric: { select: { id: true, metricName: true } },
    },
  },
} as const;

type EvaluationWithDetails = Prisma.EvaluationGetPayload<{
  include: typeof evaluationInclude;
}>;

function mapScores(
  scores: EvaluationWithDetails['scores'],
): EvaluationScoreResponseDto[] {
  return scores.map((s) => ({
    id: s.id,
    metricId: s.metricId,
    metricName: s.metric.metricName,
    score: s.score,
  }));
}

function mapEvaluation(ev: EvaluationWithDetails): EvaluationResponseDto {
  return {
    id: ev.id,
    playerId: ev.playerId,
    coachId: ev.coachId,
    evaluatedAt: ev.evaluatedAt,
    coachNotes: ev.coachNotes,
    createdAt: ev.createdAt,
    player: {
      id: ev.player.id,
      fullName: ev.player.fullName,
      position: ev.player.position,
      teamId: ev.player.teamId,
    },
    coach: {
      id: ev.coach.id,
      fullName: ev.coach.fullName,
    },
    scores: mapScores(ev.scores),
  };
}

function parseDateRange(dateStr: string): { gte: Date; lt: Date } {
  const d = new Date(dateStr);
  const gte = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const lt = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1),
  );
  return { gte, lt };
}

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Metrics
  // ---------------------------------------------------------------------------

  async createMetric(
    academyId: string,
    dto: CreateMetricDto,
  ): Promise<MetricResponseDto> {
    const duplicate = await this.prisma.evaluationMetric.findFirst({
      where: {
        academyId,
        metricName: { equals: dto.metricName, mode: 'insensitive' },
      },
    });
    if (duplicate) {
      throw new ConflictException(
        'Ya existe una métrica con ese nombre en la academia',
      );
    }

    const metric = await this.prisma.evaluationMetric.create({
      data: {
        academyId,
        metricName: dto.metricName,
        sortOrder: dto.sortOrder,
      },
    });

    return metric;
  }

  async findAllMetrics(academyId: string): Promise<MetricResponseDto[]> {
    return this.prisma.evaluationMetric.findMany({
      where: { academyId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateMetric(
    academyId: string,
    id: string,
    dto: UpdateMetricDto,
  ): Promise<MetricResponseDto> {
    const metric = await this.prisma.evaluationMetric.findFirst({
      where: { id, academyId },
    });
    if (!metric) {
      throw new NotFoundException('Métrica no encontrada');
    }

    if (dto.metricName !== undefined) {
      const duplicate = await this.prisma.evaluationMetric.findFirst({
        where: {
          academyId,
          metricName: { equals: dto.metricName, mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (duplicate) {
        throw new ConflictException(
          'Ya existe una métrica con ese nombre en la academia',
        );
      }
    }

    return this.prisma.evaluationMetric.update({
      where: { id },
      data: {
        ...(dto.metricName !== undefined && { metricName: dto.metricName }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteMetric(academyId: string, id: string): Promise<void> {
    const metric = await this.prisma.evaluationMetric.findFirst({
      where: { id, academyId },
    });
    if (!metric) {
      throw new NotFoundException('Métrica no encontrada');
    }

    const usedInScores = await this.prisma.evaluationScore.findFirst({
      where: { metricId: id },
    });
    if (usedInScores) {
      throw new BadRequestException(
        'No se puede eliminar una métrica que ya tiene evaluaciones registradas. Puedes desactivarla en su lugar.',
      );
    }

    await this.prisma.evaluationMetric.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ---------------------------------------------------------------------------
  // Evaluations
  // ---------------------------------------------------------------------------

  async createEvaluation(
    academyId: string,
    userId: string,
    role: Role,
    dto: CreateEvaluationDto,
  ): Promise<EvaluationResponseDto> {
    const player = await this.prisma.player.findFirst({
      where: { id: dto.playerId, academyId, isActive: true },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado o no pertenece a esta academia');
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: player.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este jugador');
      }
    }

    const metricIds = dto.scores.map((s) => s.metricId);
    const activeMetrics = await this.prisma.evaluationMetric.findMany({
      where: { id: { in: metricIds }, academyId, isActive: true },
      select: { id: true },
    });
    if (activeMetrics.length !== metricIds.length) {
      throw new BadRequestException(
        'Una o más métricas no son válidas o están inactivas',
      );
    }

    const duplicate = await this.prisma.evaluation.findFirst({
      where: {
        playerId: dto.playerId,
        evaluatedAt: parseDateRange(dto.evaluatedAt),
      },
    });
    if (duplicate) {
      throw new ConflictException(
        'Ya existe una evaluación para este jugador en esa fecha',
      );
    }

    const evaluatedAt = new Date(dto.evaluatedAt);

    const evaluation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.evaluation.create({
        data: {
          playerId: dto.playerId,
          coachId: userId,
          evaluatedAt,
          coachNotes: dto.coachNotes,
          scores: {
            create: dto.scores.map((s) => ({
              metricId: s.metricId,
              score: s.score,
            })),
          },
        },
      });

      return tx.evaluation.findUniqueOrThrow({
        where: { id: created.id },
        include: evaluationInclude,
      });
    });

    const parentLinks = await this.prisma.playerParent.findMany({
      where: { playerId: dto.playerId },
      select: { userId: true },
    });

    for (const { userId: parentUserId } of parentLinks) {
      await this.notificationsService.createNotification({
        userId: parentUserId,
        academyId,
        title: 'Nueva evaluación disponible',
        message: `Tu hijo/a ${player.fullName} tiene una nueva evaluación del ${dto.evaluatedAt}.`,
      });
    }

    return mapEvaluation(evaluation);
  }

  async findAllEvaluations(
    academyId: string,
    userId: string,
    role: Role,
    playerId?: string,
    teamId?: string,
  ): Promise<EvaluationResponseDto[]> {
    const where: Prisma.EvaluationWhereInput = {
      player: {
        academyId,
        ...(playerId && { id: playerId }),
        ...(teamId && { teamId }),
        ...(role === Role.coach && {
          team: { coaches: { some: { userId } } },
        }),
      },
    };

    const evaluations = await this.prisma.evaluation.findMany({
      where,
      include: evaluationInclude,
      orderBy: { evaluatedAt: 'desc' },
    });

    return evaluations.map(mapEvaluation);
  }

  async findOneEvaluation(
    academyId: string,
    userId: string,
    role: Role,
    id: string,
  ): Promise<EvaluationResponseDto> {
    const evaluation = await this.prisma.evaluation.findFirst({
      where: { id, player: { academyId } },
      include: evaluationInclude,
    });
    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: evaluation.player.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a esta evaluación');
      }
    }

    if (role === Role.parent) {
      const linked = await this.prisma.playerParent.findFirst({
        where: { playerId: evaluation.playerId, userId },
      });
      if (!linked) {
        throw new ForbiddenException('No tienes acceso a esta evaluación');
      }
    }

    return mapEvaluation(evaluation);
  }

  async getPlayerProgress(
    academyId: string,
    userId: string,
    role: Role,
    playerId: string,
    from?: string,
    to?: string,
  ): Promise<PlayerProgressResponseDto> {
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, academyId },
      select: { id: true, fullName: true, position: true, teamId: true },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    if (role === Role.coach) {
      const assigned = await this.prisma.teamCoach.findFirst({
        where: { teamId: player.teamId, userId },
      });
      if (!assigned) {
        throw new ForbiddenException('No tienes acceso a este jugador');
      }
    }

    if (role === Role.parent) {
      const linked = await this.prisma.playerParent.findFirst({
        where: { playerId, userId },
      });
      if (!linked) {
        throw new ForbiddenException('No tienes acceso a este jugador');
      }
    }

    const dateFilter: Prisma.DateTimeFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const evaluations = await this.prisma.evaluation.findMany({
      where: {
        playerId,
        ...(Object.keys(dateFilter).length > 0 && { evaluatedAt: dateFilter }),
      },
      include: evaluationInclude,
      orderBy: { evaluatedAt: 'asc' },
    });

    const playerInfo: PlayerInfoDto = {
      id: player.id,
      fullName: player.fullName,
      position: player.position,
      teamId: player.teamId,
    };

    return {
      player: playerInfo,
      evaluations: evaluations.map((ev) => ({
        evaluatedAt: ev.evaluatedAt,
        coachNotes: ev.coachNotes,
        scores: mapScores(ev.scores),
      })),
    };
  }
}
