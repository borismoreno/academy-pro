import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MatchType } from '@prisma/client';

export class CreateMatchDto {
  @IsEnum(MatchType)
  matchType: MatchType;

  @IsUUID()
  teamId: string;

  @IsOptional()
  @IsString()
  opponent?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDateString()
  matchDate: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreLocal?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreVisitor?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
