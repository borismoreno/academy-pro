import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class MatchLineupEntryDto {
  @IsUUID()
  playerId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minutesPlayed?: number;

  @IsOptional()
  @IsBoolean()
  isStarter?: boolean;
}

export class MatchPlayerStatEntryDto {
  @IsUUID()
  playerId: string;

  @IsUUID()
  metricId: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsBoolean()
  boolValue?: boolean;
}

export class SaveMatchResultsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchLineupEntryDto)
  lineups: MatchLineupEntryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchPlayerStatEntryDto)
  stats: MatchPlayerStatEntryDto[];
}
