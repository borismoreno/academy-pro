import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy.js';
import { InvitationsService } from './invitations.service.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';
import { ListInvitationsQueryDto } from './dto/invitation-response.dto.js';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @Roles(Role.academy_director)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInvitationDto,
  ) {
    const data = await this.invitationsService.create(
      user.academyId as string,
      user.sub,
      dto,
    );
    return { data, message: 'Invitación enviada exitosamente' };
  }

  @Get()
  @Roles(Role.academy_director)
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListInvitationsQueryDto,
  ) {
    const data = await this.invitationsService.findAll(
      user.academyId as string,
      query,
    );
    return { data, message: 'Invitaciones obtenidas exitosamente' };
  }

  @Public()
  @Get('accept')
  async preview(@Query('token') token: string) {
    const data = await this.invitationsService.preview(token);
    return { data, message: 'Invitación válida' };
  }

  @Public()
  @Post('accept')
  @HttpCode(HttpStatus.OK)
  async accept(@Body() dto: AcceptInvitationDto) {
    const result = await this.invitationsService.accept(dto);
    return { data: null, message: result.message };
  }

  @Delete(':id')
  @Roles(Role.academy_director)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.invitationsService.remove(user.academyId as string, id);
  }
}
