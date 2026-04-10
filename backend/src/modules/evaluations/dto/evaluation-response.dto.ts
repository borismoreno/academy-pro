export class EvaluationScoreResponseDto {
  id: string;
  metricId: string;
  metricName: string;
  score: number;
}

export class PlayerInfoDto {
  id: string;
  fullName: string;
  position: string | null;
  teamId: string;
}

export class CoachInfoDto {
  id: string;
  fullName: string;
}

export class EvaluationResponseDto {
  id: string;
  playerId: string;
  coachId: string;
  evaluatedAt: Date;
  coachNotes: string | null;
  createdAt: Date;
  player: PlayerInfoDto;
  coach: CoachInfoDto;
  scores: EvaluationScoreResponseDto[];
}

export class PlayerProgressItemDto {
  evaluatedAt: Date;
  coachNotes: string | null;
  scores: EvaluationScoreResponseDto[];
}

export class PlayerProgressResponseDto {
  player: PlayerInfoDto;
  evaluations: PlayerProgressItemDto[];
}
