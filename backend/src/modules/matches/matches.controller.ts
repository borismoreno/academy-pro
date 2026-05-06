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
} from '@nestjs/common';
import { MatchType, Role } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { CreateMatchDto } from './dto/create-match.dto.js';
import { CreateMatchStatMetricDto } from './dto/create-match-stat-metric.dto.js';
import {
  MatchListItemDto,
  MatchResponseDto,
  MatchStatMetricResponseDto,
  PlayerMatchHistoryItemDto,
  PlayerSeasonStatsResponseDto,
} from './dto/match-response.dto.js';
import { SaveMatchResultsDto } from './dto/save-match-results.dto.js';
import { UpdateMatchDto } from './dto/update-match.dto.js';
import { UpdateMatchStatMetricDto } from './dto/update-match-stat-metric.dto.js';
import { MatchesService } from './matches.service.js';

@Controller('academies/:academyId/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // ---------------------------------------------------------------------------
  // Stat metrics — declared BEFORE /:matchId to avoid route conflict
  // ---------------------------------------------------------------------------

  @Get('metrics')
  @Roles(Role.academy_director, Role.coach)
  async findAllMetrics(
    @Param('academyId') academyId: string,
  ): Promise<{ data: MatchStatMetricResponseDto[]; message: string }> {
    const data = await this.matchesService.findAllMetrics(academyId);
    return { data, message: 'Métricas obtenidas exitosamente' };
  }

  @Post('metrics')
  @Roles(Role.academy_director)
  async createMetric(
    @Param('academyId') academyId: string,
    @Body() dto: CreateMatchStatMetricDto,
  ): Promise<{ data: MatchStatMetricResponseDto; message: string }> {
    const data = await this.matchesService.createMetric(academyId, dto);
    return { data, message: 'Métrica creada exitosamente' };
  }

  @Patch('metrics/:metricId')
  @Roles(Role.academy_director)
  async updateMetric(
    @Param('academyId') academyId: string,
    @Param('metricId') metricId: string,
    @Body() dto: UpdateMatchStatMetricDto,
  ): Promise<{ data: MatchStatMetricResponseDto; message: string }> {
    const data = await this.matchesService.updateMetric(academyId, metricId, dto);
    return { data, message: 'Métrica actualizada exitosamente' };
  }

  // ---------------------------------------------------------------------------
  // Player match history and season stats — declared BEFORE /:matchId to avoid route conflict
  // ---------------------------------------------------------------------------

  @Get('players/:playerId/history')
  @Roles(Role.parent)
  async getMatchesByPlayer(
    @Param('academyId') academyId: string,
    @Param('playerId') playerId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ data: PlayerMatchHistoryItemDto[]; message: string }> {
    const data = await this.matchesService.getMatchesByPlayer(
      academyId,
      playerId,
      user.sub,
    );
    return { data, message: 'Historial de encuentros obtenido exitosamente' };
  }

  @Get('players/:playerId/season-stats')
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async getPlayerSeasonStats(
    @Param('academyId') academyId: string,
    @Param('playerId') playerId: string,
    @CurrentUser() user: JwtPayload,
    @Query('teamId') teamId?: string,
  ): Promise<{ data: PlayerSeasonStatsResponseDto; message: string }> {
    const requestingUserId =
      user.role === Role.parent ? user.sub : undefined;
    const data = await this.matchesService.getPlayerSeasonStats(
      academyId,
      playerId,
      { teamId },
      requestingUserId,
    );
    return { data, message: 'Estadísticas de temporada obtenidas exitosamente' };
  }

  // ---------------------------------------------------------------------------
  // Matches
  // ---------------------------------------------------------------------------

  @Post()
  @Roles(Role.academy_director, Role.coach)
  async createMatch(
    @Param('academyId') academyId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMatchDto,
  ): Promise<{ data: MatchResponseDto; message: string }> {
    const data = await this.matchesService.createMatch(academyId, user.sub, dto);
    return { data, message: 'Encuentro creado exitosamente' };
  }

  @Get()
  @Roles(Role.academy_director, Role.coach)
  async findAllMatches(
    @Param('academyId') academyId: string,
    @Query('teamId') teamId?: string,
    @Query('matchType') matchType?: MatchType,
    @Query('search') search?: string,
  ): Promise<{ data: MatchListItemDto[]; message: string }> {
    const data = await this.matchesService.findAllMatches(academyId, {
      teamId,
      matchType,
      search,
    });
    return { data, message: 'Encuentros obtenidos exitosamente' };
  }

  @Get(':matchId')
  @Roles(Role.academy_director, Role.coach)
  async findOneMatch(
    @Param('academyId') academyId: string,
    @Param('matchId') matchId: string,
  ): Promise<{ data: MatchResponseDto; message: string }> {
    const data = await this.matchesService.findOneMatch(academyId, matchId);
    return { data, message: 'Encuentro obtenido exitosamente' };
  }

  @Patch(':matchId')
  @Roles(Role.academy_director, Role.coach)
  async updateMatch(
    @Param('academyId') academyId: string,
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchDto,
  ): Promise<{ data: MatchResponseDto; message: string }> {
    const data = await this.matchesService.updateMatch(academyId, matchId, dto);
    return { data, message: 'Encuentro actualizado exitosamente' };
  }

  @Delete(':matchId')
  @Roles(Role.academy_director)
  @HttpCode(HttpStatus.OK)
  async deleteMatch(
    @Param('academyId') academyId: string,
    @Param('matchId') matchId: string,
  ): Promise<{ data: null; message: string }> {
    await this.matchesService.deleteMatch(academyId, matchId);
    return { data: null, message: 'Encuentro eliminado exitosamente' };
  }

  @Post(':matchId/results')
  @Roles(Role.academy_director, Role.coach)
  async saveMatchResults(
    @Param('academyId') academyId: string,
    @Param('matchId') matchId: string,
    @Body() dto: SaveMatchResultsDto,
  ): Promise<{ data: MatchResponseDto; message: string }> {
    const data = await this.matchesService.saveMatchResults(
      academyId,
      matchId,
      dto,
    );
    return { data, message: 'Resultados del encuentro guardados exitosamente' };
  }
}
