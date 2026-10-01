import {
  IsDateString,
  IsNumber,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  jerseyNumber?: number | null;

  @IsOptional()
  height?: number;

  @IsOptional()
  weight?: number;
}
