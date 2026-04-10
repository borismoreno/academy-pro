import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  @MinLength(1)
  position: string;

  @IsUUID()
  teamId: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
