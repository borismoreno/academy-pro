import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DayOfWeek } from '@prisma/client';

export class EmbeddedCoachDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class EmbeddedScheduleDto {
  @IsUUID()
  fieldId: string;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:MM format' })
  startTime: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be in HH:MM format' })
  endTime: string;
}

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(1)
  category: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmbeddedCoachDto)
  coaches?: EmbeddedCoachDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmbeddedScheduleDto)
  schedules?: EmbeddedScheduleDto[];
}
