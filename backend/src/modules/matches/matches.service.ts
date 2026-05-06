import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { verifyParentAccess } from '../../common/helpers/parent-guard.helper.js';
import { PlanGuardService } from '../plan-guard/plan-guard.service.js';
import { CreateMatchDto } from './dto/create-match.dto.js';
import { CreateMatchStatMetricDto } from './dto/create-match-stat-metric.dto.js';
import {
  MatchCreatedByDto,
  MatchLineupResponseDto,
  MatchListItemDto,
  MatchPlayerStatResponseDto,
  MatchResponseDto,
  MatchStatMetricResponseDto,
  MatchTeamDto,
  PlayerMatchHistoryItemDto,
  PlayerSeasonStatItemDto,
  PlayerSeasonStatsResponseDto,
} from './dto/match-response.dto.js';
import { SaveMatchResultsDto } from './dto/save-match-results.dto.js';
import { UpdateMatchDto } from './dto/update-match.dto.js';
import { UpdateMatchStatMetricDto } from './dto/update-match-stat-metric.dto.js';

const matchDetailInclude = {
  team: { select: { id: true, name: true } },
  createdBy: { select: { id: true, fullName: true } },
  lineups: {
    include: {
      player: { select: { id: true, fullName: true } },
    },
  },
  playerStats: {
    include: {
      player: { select: { id: true, fullName: true } },
      metric: { select: { id: true, name: true, statType: true, unitLabel: true } },
    },
  },
} as const;

type MatchWithDetails = Prisma.MatchGetPayload<{
  include: typeof matchDetailInclude;
}>;

function mapMatchDetail(match: MatchWithDetails): MatchResponseDto {
  const team: MatchTeamDto = { id: match.team.id, name: match.team.name };
  const createdBy: MatchCreatedByDto = {
    id: match.createdBy.id,
    fullName: match.createdBy.fullName,
  };
  const lineups: MatchLineupResponseDto[] = match.lineups.map((l) => ({
    id: l.id,
    playerId: l.playerId,
    playerFullName: l.player.fullName,
    minutesPlayed: l.minutesPlayed,
    isStarter: l.isStarter,
  }));
  const playerStats: MatchPlayerStatResponseDto[] = match.playerStats.map(
    (s) => ({
      id: s.id,
      playerId: s.playerId,
      playerFullName: s.player.fullName,
      metricId: s.metricId,
      metricName: s.metric.name,
      statType: s.metric.statType,
      unitLabel: s.metric.unitLabel,
      value: s.value !== null ? s.value.toString() : null,
      boolValue: s.boolValue,
    }),
  );

  return {
    id: match.id,
    academyId: match.academyId,
    matchType: match.matchType,
    opponent: match.opponent,
    location: match.location,
    matchDate: match.matchDate,
    scoreLocal: match.scoreLocal,
    scoreVisitor: match.scoreVisitor,
    notes: match.notes,
    createdAt: match.createdAt,
    team,
    createdBy,
    lineups,
    playerStats,
  };
}

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planGuard: PlanGuardService,
  ) {}

  // ---------------------------------------------------------------------------
  // Matches
  // ---------------------------------------------------------------------------

  async createMatch(
    academyId: string,
    userId: string,
    dto: CreateMatchDto,
  ): Promise<MatchResponseDto> {
    const team = await this.prisma.team.findFirst({
      where: { id: dto.teamId, academyId, isActive: true },
    });
    if (!team) {
      throw new NotFoundException(
        'Equipo no encontrado o no pertenece a esta academia',
      );
    }

    if (dto.matchType === MatchType.team_vs && !dto.opponent) {
      throw new BadRequestException(
        'El campo "opponent" es requerido para encuentros de tipo team_vs',
      );
    }

    const data: Prisma.MatchCreateInput = {
      academy: { connect: { id: academyId } },
      team: { connect: { id: dto.teamId } },
      createdBy: { connect: { id: userId } },
      matchType: dto.matchType,
      opponent: dto.matchType === MatchType.team_vs ? dto.opponent : undefined,
      location: dto.location,
      matchDate: new Date(dto.matchDate),
      scoreLocal: dto.matchType === MatchType.team_vs ? dto.scoreLocal : undefined,
      scoreVisitor: dto.matchType === MatchType.team_vs ? dto.scoreVisitor : undefined,
      notes: dto.notes,
    };

    const created = await this.prisma.match.create({ data });

    const match = await this.prisma.match.findUniqueOrThrow({
      where: { id: created.id },
      include: matchDetailInclude,
    });

    return mapMatchDetail(match);
  }

  async findAllMatches(
    academyId: string,
    filters: { teamId?: string; matchType?: MatchType; search?: string },
  ): Promise<MatchListItemDto[]> {
    const where: Prisma.MatchWhereInput = {
      academyId,
      ...(filters.teamId && { teamId: filters.teamId }),
      ...(filters.matchType && { matchType: filters.matchType }),
      ...(filters.search && {
        OR: [
          { opponent: { contains: filters.search, mode: 'insensitive' } },
          { location: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const matches = await this.prisma.match.findMany({
      where,
      orderBy: { matchDate: 'desc' },
      include: {
        team: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
        _count: { select: { lineups: true } },
      },
    });

    return matches.map((m) => ({
      id: m.id,
      academyId: m.academyId,
      matchType: m.matchType,
      opponent: m.opponent,
      location: m.location,
      matchDate: m.matchDate,
      scoreLocal: m.scoreLocal,
      scoreVisitor: m.scoreVisitor,
      notes: m.notes,
      createdAt: m.createdAt,
      team: { id: m.team.id, name: m.team.name },
      createdBy: { id: m.createdBy.id, fullName: m.createdBy.fullName },
      lineupCount: m._count.lineups,
    }));
  }

  async findOneMatch(academyId: string, matchId: string): Promise<MatchResponseDto> {
    const match = await this.prisma.match.findFirst({
      where: { id: matchId, academyId },
      include: matchDetailInclude,
    });
    if (!match) {
      throw new NotFoundException('Encuentro no encontrado');
    }
    return mapMatchDetail(match);
  }

  async updateMatch(
    academyId: string,
    matchId: string,
    dto: UpdateMatchDto,
  ): Promise<MatchResponseDto> {
    const existing = await this.prisma.match.findFirst({
      where: { id: matchId, academyId },
    });
    if (!existing) {
      throw new NotFoundException('Encuentro no encontrado');
    }

    if (dto.teamId) {
      const team = await this.prisma.team.findFirst({
        where: { id: dto.teamId, academyId, isActive: true },
      });
      if (!team) {
        throw new NotFoundException('Equipo no encontrado');
      }
    }

    const effectiveMatchType = dto.matchType ?? existing.matchType;
    if (effectiveMatchType === MatchType.team_vs) {
      const effectiveOpponent = dto.opponent ?? existing.opponent;
      if (!effectiveOpponent) {
        throw new BadRequestException(
          'El campo "opponent" es requerido para encuentros de tipo team_vs',
        );
      }
    }

    const updateData: Prisma.MatchUpdateInput = {
      ...(dto.teamId !== undefined && { team: { connect: { id: dto.teamId } } }),
      ...(dto.matchType !== undefined && { matchType: dto.matchType }),
      ...(dto.opponent !== undefined && { opponent: dto.opponent }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.matchDate !== undefined && { matchDate: new Date(dto.matchDate) }),
      ...(dto.scoreLocal !== undefined && { scoreLocal: dto.scoreLocal }),
      ...(dto.scoreVisitor !== undefined && { scoreVisitor: dto.scoreVisitor }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    };

    await this.prisma.match.update({ where: { id: matchId }, data: updateData });

    return this.findOneMatch(academyId, matchId);
  }

  async deleteMatch(academyId: string, matchId: string): Promise<void> {
    const existing = await this.prisma.match.findFirst({
      where: { id: matchId, academyId },
    });
    if (!existing) {
      throw new NotFoundException('Encuentro no encontrado');
    }

    await this.prisma.$transaction([
      this.prisma.matchPlayerStat.deleteMany({ where: { matchId } }),
      this.prisma.matchLineup.deleteMany({ where: { matchId } }),
      this.prisma.match.delete({ where: { id: matchId } }),
    ]);
  }

  async saveMatchResults(
    academyId: string,
    matchId: string,
    dto: SaveMatchResultsDto,
  ): Promise<MatchResponseDto> {
    const existing = await this.prisma.match.findFirst({
      where: { id: matchId, academyId },
    });
    if (!existing) {
      throw new NotFoundException('Encuentro no encontrado');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const entry of dto.lineups) {
        await tx.matchLineup.upsert({
          where: { matchId_playerId: { matchId, playerId: entry.playerId } },
          create: {
            matchId,
            playerId: entry.playerId,
            minutesPlayed: entry.minutesPlayed,
            isStarter: entry.isStarter ?? false,
          },
          update: {
            ...(entry.minutesPlayed !== undefined && { minutesPlayed: entry.minutesPlayed }),
            ...(entry.isStarter !== undefined && { isStarter: entry.isStarter }),
          },
        });
      }

      for (const stat of dto.stats) {
        await tx.matchPlayerStat.upsert({
          where: {
            matchId_playerId_metricId: {
              matchId,
              playerId: stat.playerId,
              metricId: stat.metricId,
            },
          },
          create: {
            matchId,
            playerId: stat.playerId,
            metricId: stat.metricId,
            value: stat.value !== undefined ? stat.value : undefined,
            boolValue: stat.boolValue,
          },
          update: {
            ...(stat.value !== undefined && { value: stat.value }),
            ...(stat.boolValue !== undefined && { boolValue: stat.boolValue }),
          },
        });
      }
    });

    return this.findOneMatch(academyId, matchId);
  }

  async getMatchesByPlayer(
    academyId: string,
    playerId: string,
    requestingUserId: string,
  ): Promise<PlayerMatchHistoryItemDto[]> {
    await verifyParentAccess(this.prisma, playerId, requestingUserId);
    await this.planGuard.validateLimit(academyId, 'parent_portal_matches');

    const lineups = await this.prisma.matchLineup.findMany({
      where: {
        playerId,
        match: { academyId },
      },
      include: {
        match: {
          include: {
            team: { select: { id: true, name: true } },
            playerStats: {
              where: { playerId },
              include: {
                metric: {
                  select: {
                    id: true,
                    name: true,
                    statType: true,
                    unitLabel: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { match: { matchDate: 'desc' } },
    });

    return lineups.map((l) => ({
      id: l.match.id,
      matchType: l.match.matchType,
      opponent: l.match.opponent,
      location: l.match.location,
      matchDate: l.match.matchDate,
      scoreLocal: l.match.scoreLocal,
      scoreVisitor: l.match.scoreVisitor,
      team: { id: l.match.team.id, name: l.match.team.name },
      lineupEntry: {
        minutesPlayed: l.minutesPlayed,
        isStarter: l.isStarter,
      },
      playerStats: l.match.playerStats.map((s) => ({
        metricId: s.metric.id,
        metricName: s.metric.name,
        statType: s.metric.statType,
        unitLabel: s.metric.unitLabel,
        value: s.value !== null ? s.value.toString() : null,
        boolValue: s.boolValue,
      })),
    }));
  }

  async getPlayerSeasonStats(
    academyId: string,
    playerId: string,
    filters?: { teamId?: string },
    requestingUserId?: string,
  ): Promise<PlayerSeasonStatsResponseDto> {
    if (requestingUserId) {
      await verifyParentAccess(this.prisma, playerId, requestingUserId);
      await this.planGuard.validateLimit(academyId, 'parent_portal_matches');
    }

    const player = await this.prisma.player.findFirst({
      where: { id: playerId, academyId },
      select: { id: true, fullName: true },
    });
    if (!player) {
      throw new NotFoundException('Jugador no encontrado');
    }

    const lineupWhere: Prisma.MatchLineupWhereInput = {
      playerId,
      match: {
        academyId,
        ...(filters?.teamId && { teamId: filters.teamId }),
      },
    };

    const lineups = await this.prisma.matchLineup.findMany({
      where: lineupWhere,
      select: { minutesPlayed: true },
    });

    const matchesPlayed = lineups.length;
    const minutesPlayed = lineups.reduce(
      (sum, l) => sum + (l.minutesPlayed ?? 0),
      0,
    );

    const statsWhere: Prisma.MatchPlayerStatWhereInput = {
      playerId,
      match: {
        academyId,
        ...(filters?.teamId && { teamId: filters.teamId }),
      },
    };

    const rawStats = await this.prisma.matchPlayerStat.findMany({
      where: statsWhere,
      include: {
        metric: { select: { id: true, name: true, statType: true, unitLabel: true } },
      },
    });

    const metricMap = new Map<
      string,
      {
        metricId: string;
        metricName: string;
        statType: string;
        unitLabel: string | null;
        numericTotal: number;
        boolCount: number;
        count: number;
      }
    >();

    for (const stat of rawStats) {
      const key = stat.metricId;
      if (!metricMap.has(key)) {
        metricMap.set(key, {
          metricId: stat.metric.id,
          metricName: stat.metric.name,
          statType: stat.metric.statType,
          unitLabel: stat.metric.unitLabel,
          numericTotal: 0,
          boolCount: 0,
          count: 0,
        });
      }
      const entry = metricMap.get(key)!;
      entry.count += 1;
      if (stat.value !== null) {
        entry.numericTotal += parseFloat(stat.value.toString());
      }
      if (stat.boolValue === true) {
        entry.boolCount += 1;
      }
    }

    const statsByStat: PlayerSeasonStatItemDto[] = Array.from(
      metricMap.values(),
    ).map((entry) => {
      const isBool = entry.statType === 'boolean';
      const total = isBool ? entry.boolCount : entry.numericTotal;
      const average =
        matchesPlayed > 0
          ? Math.round((total / matchesPlayed) * 10) / 10
          : 0;

      return {
        metricId: entry.metricId,
        metricName: entry.metricName,
        statType: entry.statType as PlayerSeasonStatItemDto['statType'],
        unitLabel: entry.unitLabel,
        total,
        average,
      };
    });

    return {
      playerId: player.id,
      playerFullName: player.fullName,
      matchesPlayed,
      minutesPlayed,
      statsByStat,
    };
  }

  // ---------------------------------------------------------------------------
  // Stat metrics
  // ---------------------------------------------------------------------------

  async createMetric(
    academyId: string,
    dto: CreateMatchStatMetricDto,
  ): Promise<MatchStatMetricResponseDto> {
    const lastMetric = await this.prisma.matchStatMetric.findFirst({
      where: { academyId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const sortOrder =
      dto.sortOrder !== undefined
        ? dto.sortOrder
        : (lastMetric?.sortOrder ?? 0) + 1;

    return this.prisma.matchStatMetric.create({
      data: {
        academyId,
        name: dto.name,
        statType: dto.statType,
        unitLabel: dto.unitLabel,
        sortOrder,
      },
    });
  }

  async findAllMetrics(academyId: string): Promise<MatchStatMetricResponseDto[]> {
    return this.prisma.matchStatMetric.findMany({
      where: { academyId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateMetric(
    academyId: string,
    metricId: string,
    dto: UpdateMatchStatMetricDto,
  ): Promise<MatchStatMetricResponseDto> {
    const existing = await this.prisma.matchStatMetric.findFirst({
      where: { id: metricId, academyId },
    });
    if (!existing) {
      throw new NotFoundException('Métrica no encontrada');
    }

    return this.prisma.matchStatMetric.update({
      where: { id: metricId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.statType !== undefined && { statType: dto.statType }),
        ...(dto.unitLabel !== undefined && { unitLabel: dto.unitLabel }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }
}
