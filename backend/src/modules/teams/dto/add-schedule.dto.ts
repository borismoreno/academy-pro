import { IsEnum, IsString, IsUUID, Matches } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

export class AddScheduleDto {
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
