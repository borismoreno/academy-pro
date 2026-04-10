import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { CreateFieldDto } from './dto/create-field.dto.js';
import { FieldResponseDto } from './dto/field-response.dto.js';
import { UpdateFieldDto } from './dto/update-field.dto.js';
import { FieldsService } from './fields.service.js';

@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Post()
  @Roles(Role.academy_director)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateFieldDto,
  ): Promise<{ data: FieldResponseDto; message: string }> {
    const data = await this.fieldsService.create(user.academyId as string, dto);
    return { data, message: 'Cancha creada exitosamente' };
  }

  @Get()
  @Roles(Role.academy_director, Role.coach)
  async findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ data: FieldResponseDto[]; message: string }> {
    const data = await this.fieldsService.findAll(user.academyId as string);
    return { data, message: 'Canchas obtenidas exitosamente' };
  }

  @Get(':id')
  @Roles(Role.academy_director, Role.coach)
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: FieldResponseDto; message: string }> {
    const data = await this.fieldsService.findOne(user.academyId as string, id);
    return { data, message: 'Cancha obtenida exitosamente' };
  }

  @Patch(':id')
  @Roles(Role.academy_director)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateFieldDto,
  ): Promise<{ data: FieldResponseDto; message: string }> {
    const data = await this.fieldsService.update(user.academyId as string, id, dto);
    return { data, message: 'Cancha actualizada exitosamente' };
  }

  @Delete(':id')
  @Roles(Role.academy_director)
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: null; message: string }> {
    await this.fieldsService.remove(user.academyId as string, id);
    return { data: null, message: 'Cancha eliminada exitosamente' };
  }
}
