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
import { AddParentDto } from './dto/add-parent.dto.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { PlayerParentResponseDto, PlayerResponseDto } from './dto/player-response.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';
import { PlayersService } from './players.service.js';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @Roles(Role.academy_director, Role.coach)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePlayerDto,
  ): Promise<{ data: PlayerResponseDto; message: string }> {
    const data = await this.playersService.create(
      user.academyId as string,
      user.sub,
      user.role as Role,
      dto,
    );
    return { data, message: 'Jugador creado exitosamente' };
  }

  @Get()
  @Roles(Role.academy_director, Role.coach)
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('teamId') teamId?: string,
    @Query('position') position?: string,
  ): Promise<{ data: PlayerResponseDto[]; message: string }> {
    const data = await this.playersService.findAll(
      user.academyId as string,
      user.sub,
      user.role as Role,
      teamId,
      position,
    );
    return { data, message: 'Jugadores obtenidos exitosamente' };
  }

  @Get(':id')
  @Roles(Role.academy_director, Role.coach, Role.parent)
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: PlayerResponseDto; message: string }> {
    const data = await this.playersService.findOne(
      user.academyId as string,
      user.sub,
      user.role as Role,
      id,
    );
    return { data, message: 'Jugador obtenido exitosamente' };
  }

  @Patch(':id')
  @Roles(Role.academy_director, Role.coach)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePlayerDto,
  ): Promise<{ data: PlayerResponseDto; message: string }> {
    const data = await this.playersService.update(
      user.academyId as string,
      user.sub,
      user.role as Role,
      id,
      dto,
    );
    return { data, message: 'Jugador actualizado exitosamente' };
  }

  @Delete(':id')
  @Roles(Role.academy_director)
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: null; message: string }> {
    await this.playersService.remove(user.academyId as string, id);
    return { data: null, message: 'Jugador eliminado exitosamente' };
  }

  @Post(':id/parents')
  @Roles(Role.academy_director)
  async addParent(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddParentDto,
  ): Promise<{ data: PlayerParentResponseDto; message: string }> {
    const data = await this.playersService.addParent(user.academyId as string, id, dto);
    return { data, message: 'Padre/tutor vinculado exitosamente' };
  }

  @Delete(':id/parents/:userId')
  @Roles(Role.academy_director)
  @HttpCode(HttpStatus.OK)
  async removeParent(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<{ data: null; message: string }> {
    await this.playersService.removeParent(user.academyId as string, id, userId);
    return { data: null, message: 'Padre/tutor desvinculado exitosamente' };
  }
}
