import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  teamId: string;

  @IsDateString()
  sessionDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
