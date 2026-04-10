import { InvitationStatus, Role } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class InvitationResponseDto {
  id: string;
  academyId: string;
  invitedBy: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export class InvitationPreviewDto {
  email: string;
  role: Role;
  academyName: string;
}

export class ListInvitationsQueryDto {
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;
}
