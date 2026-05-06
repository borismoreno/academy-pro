import { MatchType, StatType } from '@prisma/client';

export class MatchTeamDto {
  id: string;
  name: string;
}

export class MatchCreatedByDto {
  id: string;
  fullName: string;
}

export class MatchLineupResponseDto {
  id: string;
  playerId: string;
  playerFullName: string;
  minutesPlayed: number | null;
  isStarter: boolean;
}

export class MatchPlayerStatResponseDto {
  id: string;
  playerId: string;
  playerFullName: string;
  metricId: string;
  metricName: string;
  statType: StatType;
  unitLabel: string | null;
  value: string | null;
  boolValue: boolean | null;
}

export class MatchResponseDto {
  id: string;
  academyId: string;
  matchType: MatchType;
  opponent: string | null;
  location: string | null;
  matchDate: Date;
  scoreLocal: number | null;
  scoreVisitor: number | null;
  notes: string | null;
  createdAt: Date;
  team: MatchTeamDto;
  createdBy: MatchCreatedByDto;
  lineups: MatchLineupResponseDto[];
  playerStats: MatchPlayerStatResponseDto[];
}

export class MatchListItemDto {
  id: string;
  academyId: string;
  matchType: MatchType;
  opponent: string | null;
  location: string | null;
  matchDate: Date;
  scoreLocal: number | null;
  scoreVisitor: number | null;
  notes: string | null;
  createdAt: Date;
  team: MatchTeamDto;
  createdBy: MatchCreatedByDto;
  lineupCount: number;
}

export class MatchStatMetricResponseDto {
  id: string;
  academyId: string;
  name: string;
  statType: StatType;
  unitLabel: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

export class PlayerSeasonStatItemDto {
  metricId: string;
  metricName: string;
  statType: StatType;
  unitLabel: string | null;
  total: number;
  average: number;
}

export class PlayerSeasonStatsResponseDto {
  playerId: string;
  playerFullName: string;
  matchesPlayed: number;
  minutesPlayed: number;
  statsByStat: PlayerSeasonStatItemDto[];
}
