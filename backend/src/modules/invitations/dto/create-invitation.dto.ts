import { BadRequestException } from '@nestjs/common';
import { IsEmail, IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum InvitableRole {
  coach = 'coach',
  parent = 'parent',
  academy_director = 'academy_director',
}

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(InvitableRole)
  role: InvitableRole;

  @IsOptional()
  @IsUUID()
  playerId?: string;

  validate(): void {
    if (this.playerId && this.role !== InvitableRole.parent) {
      throw new BadRequestException(
        'No se puede vincular un jugador a una invitación que no es para un padre',
      );
    }
  }
}
