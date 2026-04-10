import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ScoreItemDto {
  @IsUUID()
  metricId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score: number;
}

export class CreateEvaluationDto {
  @IsUUID()
  playerId: string;

  @IsDateString()
  evaluatedAt: string;

  @IsOptional()
  @IsString()
  coachNotes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ScoreItemDto)
  scores: ScoreItemDto[];
}
