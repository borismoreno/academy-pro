import { DayOfWeek } from '@prisma/client';

export class FieldInfoDto {
  id: string;
  name: string;
  location: string | null;
}

export class ScheduleResponseDto {
  id: string;
  teamId: string;
  fieldId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  createdAt: Date;
  field: FieldInfoDto;
}

export class CoachUserDto {
  id: string;
  fullName: string;
  email: string;
}

export class TeamCoachResponseDto {
  id: string;
  teamId: string;
  userId: string;
  isPrimary: boolean;
  createdAt: Date;
  user: CoachUserDto;
}

export class TeamResponseDto {
  id: string;
  academyId: string;
  name: string;
  category: string | null;
  isActive: boolean;
  createdAt: Date;
  coaches: TeamCoachResponseDto[];
  schedules: ScheduleResponseDto[];
}
