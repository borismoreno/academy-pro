import { BadRequestException } from '@nestjs/common';
import { IsEmail, IsEnum, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export enum InvitableRole {
  coach = 'coach',
  parent = 'parent',
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
    if (this.playerId && this.role === InvitableRole.coach) {
      throw new BadRequestException(
        'No se puede vincular un jugador a una invitación de coach',
      );
    }
  }
}
