import { StatType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMatchStatMetricDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(StatType)
  statType: StatType;

  @IsOptional()
  @IsString()
  unitLabel?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
