export type MatchType = 'team_vs' | 'individual';
export type StatType = 'count' | 'time_seconds' | 'distance_meters' | 'rating' | 'boolean';

export interface MatchStatMetric {
  id: string;
  name: string;
  statType: StatType;
  unitLabel: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface MatchLineup {
  id: string;
  playerId: string;
  playerFullName: string;
  minutesPlayed: number | null;
  isStarter: boolean;
}

export interface MatchPlayerStat {
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

export interface Match {
  id: string;
  academyId: string;
  matchType: MatchType;
  opponent: string | null;
  location: string | null;
  matchDate: string;
  scoreLocal: number | null;
  scoreVisitor: number | null;
  notes: string | null;
  team: { id: string; name: string };
  createdBy: { id: string; fullName: string };
  lineups: MatchLineup[];
  playerStats: MatchPlayerStat[];
  createdAt: string;
}

export interface MatchSummary {
  id: string;
  academyId: string;
  matchType: MatchType;
  opponent: string | null;
  location: string | null;
  matchDate: string;
  scoreLocal: number | null;
  scoreVisitor: number | null;
  notes: string | null;
  team: { id: string; name: string };
  createdBy: { id: string; fullName: string };
  lineupCount: number;
  createdAt: string;
}

export interface PlayerSeasonStat {
  metricId: string;
  metricName: string;
  statType: StatType;
  unitLabel: string | null;
  total: number;
  average: number;
}

export interface PlayerSeasonSummary {
  playerId: string;
  playerFullName: string;
  matchesPlayed: number;
  minutesPlayed: number;
  statsByStat: PlayerSeasonStat[];
}

export interface PortalMatchEntry {
  id: string;
  matchType: MatchType;
  opponent: string | null;
  location: string | null;
  matchDate: string;
  scoreLocal: number | null;
  scoreVisitor: number | null;
  team: { name: string };
  lineupEntry: {
    minutesPlayed: number | null;
    isStarter: boolean;
  };
  playerStats: {
    metricId: string;
    metricName: string;
    statType: StatType;
    unitLabel: string | null;
    value: string | null;
    boolValue: boolean | null;
  }[];
}

// ── Request shapes (mirror backend DTOs) ─────────────────────────────────────

export interface CreateMatchData {
  matchType: MatchType;
  teamId: string;
  opponent?: string;
  location?: string;
  matchDate: string;
  scoreLocal?: number;
  scoreVisitor?: number;
  notes?: string;
}

export interface UpdateMatchData {
  matchType?: MatchType;
  teamId?: string;
  opponent?: string;
  location?: string;
  matchDate?: string;
  scoreLocal?: number;
  scoreVisitor?: number;
  notes?: string;
}

export interface MatchLineupEntry {
  playerId: string;
  minutesPlayed?: number;
  isStarter?: boolean;
}

export interface MatchPlayerStatEntry {
  playerId: string;
  metricId: string;
  value?: number;
  boolValue?: boolean;
}

export interface SaveMatchResultsData {
  lineups: MatchLineupEntry[];
  stats: MatchPlayerStatEntry[];
}

export interface CreateMatchStatMetricData {
  name: string;
  statType: StatType;
  unitLabel?: string;
  sortOrder?: number;
}

export interface UpdateMatchStatMetricData {
  name?: string;
  statType?: StatType;
  unitLabel?: string;
  sortOrder?: number;
  isActive?: boolean;
}
