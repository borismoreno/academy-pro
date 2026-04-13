import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles, Role } from '../../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { OwnerService } from './owner.service.js';
import { CreateAcademyDto } from './dto/create-academy.dto.js';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto.js';
import { UpdatePlanLimitDto } from './dto/update-plan-limit.dto.js';

@Controller('owner')
@Roles(Role.saas_owner)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('stats')
  async getStats() {
    const data = await this.ownerService.getStats();
    return { message: 'Estadísticas obtenidas correctamente', data };
  }

  @Get('academies')
  async getAcademies(@Query('search') search?: string) {
    const data = await this.ownerService.getAcademies(search);
    return { message: 'Academias obtenidas correctamente', data };
  }

  @Get('academies/:id')
  async getAcademyById(@Param('id') id: string) {
    const data = await this.ownerService.getAcademyById(id);
    return { message: 'Academia obtenida correctamente', data };
  }

  @Post('academies')
  async createAcademy(
    @Body() dto: CreateAcademyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.ownerService.createAcademy(dto, user.sub);
    return { message: 'Academia creada correctamente', data };
  }

  @Patch('academies/:id/subscription')
  async updateSubscription(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    const data = await this.ownerService.updateSubscription(id, dto);
    return { message: 'Suscripción actualizada correctamente', data };
  }

  @Get('plan-limits')
  async getPlanLimits() {
    const data = await this.ownerService.getPlanLimits();
    return { message: 'Límites obtenidos correctamente', data };
  }

  @Patch('plan-limits/:id')
  async updatePlanLimit(
    @Param('id') id: string,
    @Body() dto: UpdatePlanLimitDto,
  ) {
    const data = await this.ownerService.updatePlanLimit(id, dto);
    return { message: 'Límite actualizado correctamente', data };
  }

  @Get('users')
  async getUsers(@Query('search') search?: string) {
    const data = await this.ownerService.getUsers(search);
    return { message: 'Usuarios obtenidos correctamente', data };
  }
}
