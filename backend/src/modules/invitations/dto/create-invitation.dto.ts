import { IsEmail, IsEnum } from 'class-validator';

export enum InvitableRole {
  coach = 'coach',
  parent = 'parent',
}

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(InvitableRole)
  role: InvitableRole;
}
