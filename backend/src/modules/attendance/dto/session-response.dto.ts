import { AttendanceRecordResponseDto } from './attendance-record-response.dto.js';

export class TeamInfoDto {
  id: string;
  name: string;
}

export class SessionResponseDto {
  id: string;
  teamId: string;
  coachId: string | null;
  sessionDate: Date;
  notes: string | null;
  createdAt: Date;
  team: TeamInfoDto;
  records: AttendanceRecordResponseDto[];
  totalPresent: number;
  totalAbsent: number;
}

export class SessionListResponseDto {
  id: string;
  teamId: string;
  coachId: string | null;
  sessionDate: Date;
  notes: string | null;
  createdAt: Date;
  team: TeamInfoDto;
  totalPresent: number;
  totalAbsent: number;
}

export class PlayerAttendanceSummaryItemDto {
  sessionId: string;
  sessionDate: Date;
  present: boolean;
}

export class PlayerAttendanceSummaryDto {
  playerId: string;
  totalSessions: number;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
  sessions: PlayerAttendanceSummaryItemDto[];
}
