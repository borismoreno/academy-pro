import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { AcademiesService } from './academies.service.js';
import {
  AcademyMemberResponseDto,
  AcademyResponseDto,
  AcademySubscriptionResponseDto,
} from './dto/academy-response.dto.js';
import { ListAcademiesQueryDto } from './dto/list-academies-query.dto.js';
import { ListMembersQueryDto } from './dto/list-members-query.dto.js';
import { UpdateAcademyDto } from './dto/update-academy.dto.js';

@Controller('academies')
export class AcademiesController {
  constructor(private readonly academiesService: AcademiesService) {}

  @Get('me')
  async getMyAcademy(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ data: AcademyResponseDto; message: string }> {
    const data = await this.academiesService.getMyAcademy(
      user.academyId as string,
    );
    return { data, message: 'Academia obtenida exitosamente' };
  }

  @Get('members')
  @Roles(Role.academy_director, Role.coach)
  async getMembers(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListMembersQueryDto,
  ): Promise<{ data: AcademyMemberResponseDto[]; message: string }> {
    const data = await this.academiesService.getMembers(
      user.academyId as string,
      query.role,
    );
    return { data, message: 'Miembros obtenidos exitosamente' };
  }

  @Patch('me')
  @Roles(Role.academy_director)
  async updateMyAcademy(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAcademyDto,
  ): Promise<{ data: AcademyResponseDto; message: string }> {
    const data = await this.academiesService.updateMyAcademy(
      user.academyId as string,
      dto,
    );
    return { data, message: 'Academia actualizada exitosamente' };
  }

  @Get()
  @Roles(Role.saas_owner)
  async findAll(
    @Query() query: ListAcademiesQueryDto,
  ): Promise<{ data: AcademyResponseDto[]; message: string }> {
    const data = await this.academiesService.findAll(query);
    return { data, message: 'Academias obtenidas exitosamente' };
  }

  @Patch(':id/suspend')
  @Roles(Role.saas_owner)
  async suspendAcademy(
    @Param('id') id: string,
  ): Promise<{ data: AcademySubscriptionResponseDto; message: string }> {
    const data = await this.academiesService.suspendAcademy(id);
    return { data, message: 'Academia suspendida exitosamente' };
  }
}
