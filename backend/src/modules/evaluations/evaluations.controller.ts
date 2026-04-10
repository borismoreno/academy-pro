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
import { Role } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { CreateEvaluationDto } from './dto/create-evaluation.dto.js';
import { CreateMetricDto } from './dto/create-metric.dto.js';
import {
  EvaluationResponseDto,
  PlayerProgressResponseDto,
} from './dto/evaluation-response.dto.js';
import { MetricResponseDto } from './dto/metric-response.dto.js';
import { UpdateMetricDto } from './dto/update-metric.dto.js';
import { EvaluationsService } from './evaluations.service.js';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  // ---------------------------------------------------------------------------
  // Metrics
  // ---------------------------------------------------------------------------

  @Post('metrics')
  @Roles(Role.academy_director)
  async createMetric(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMetricDto,
  ): Promise<{ data: MetricResponseDto; message: string }> {
    const data = await this.evaluationsService.createMetric(
      user.academyId as string,
      dto,
    );
    return { data, message: 'Métrica creada exitosamente' };
  }

  @Get('metrics')
  @Roles(Role.academy_director, Role.coach)
  async findAllMetrics(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ data: MetricResponseDto[]; message: string }> {
    const data = await this.evaluationsService.findAllMetrics(
      user.academyId as string,
    );
    return { data, message: 'Métricas obtenidas exitosamente' };
  }

  @Patch('metrics/:id')
  @Roles(Role.academy_director)
  async updateMetric(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMetricDto,
  ): Promise<{ data: MetricResponseDto; message: string }> {
    const data = await this.evaluationsService.updateMetric(
      user.academyId as string,
      id,
      dto,
    );
    return { data, message: 'Métrica actualizada exitosamente' };
  }

  @Delete('metrics/:id')
  @Roles(Role.academy_director)
  @HttpCode(HttpStatus.OK)
  async deleteMetric(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: null; message: string }> {
    await this.evaluationsService.deleteMetric(user.academyId as string, id);
    return { data: null, message: 'Métrica eliminada exitosamente' };
  }

  // ---------------------------------------------------------------------------
  // Evaluations
  // ---------------------------------------------------------------------------

  @Post()
  @Roles(Role.academy_director, Role.coach)
  async createEvaluation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateEvaluationDto,
  ): Promise<{ data: EvaluationResponseDto; message: string }> {
    const data = await this.evaluationsService.createEvaluation(
      user.academyId as string,
      user.sub,
      user.role as Role,
      dto,
    );
    return { data, message: 'Evaluación creada exitosamente' };
  }

  // NOTE: specific routes must be declared before dynamic /:id routes
  @Get('players/:playerId/progress')
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async getPlayerProgress(
    @CurrentUser() user: JwtPayload,
    @Param('playerId') playerId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<{ data: PlayerProgressResponseDto; message: string }> {
    const data = await this.evaluationsService.getPlayerProgress(
      user.academyId as string,
      user.sub,
      user.role as Role,
      playerId,
      from,
      to,
    );
    return { data, message: 'Progreso del jugador obtenido exitosamente' };
  }

  @Get(':id')
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async findOneEvaluation(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: EvaluationResponseDto; message: string }> {
    const data = await this.evaluationsService.findOneEvaluation(
      user.academyId as string,
      user.sub,
      user.role as Role,
      id,
    );
    return { data, message: 'Evaluación obtenida exitosamente' };
  }

  @Get()
  @Roles(Role.academy_director, Role.coach)
  async findAllEvaluations(
    @CurrentUser() user: JwtPayload,
    @Query('playerId') playerId?: string,
    @Query('teamId') teamId?: string,
  ): Promise<{ data: EvaluationResponseDto[]; message: string }> {
    const data = await this.evaluationsService.findAllEvaluations(
      user.academyId as string,
      user.sub,
      user.role as Role,
      playerId,
      teamId,
    );
    return { data, message: 'Evaluaciones obtenidas exitosamente' };
  }
}
