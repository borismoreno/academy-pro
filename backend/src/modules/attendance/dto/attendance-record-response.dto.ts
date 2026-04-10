export class PlayerInfoDto {
  id: string;
  fullName: string;
  position: string | null;
  teamId: string;
}

export class AttendanceRecordResponseDto {
  id: string;
  sessionId: string;
  playerId: string;
  present: boolean;
  createdAt: Date;
  player: PlayerInfoDto;
}
