import api from './api';
import type { ApiResponse } from '@/types';
import type {
  Match,
  MatchSummary,
  MatchStatMetric,
  PlayerSeasonSummary,
  CreateMatchData,
  UpdateMatchData,
  SaveMatchResultsData,
  CreateMatchStatMetricData,
  UpdateMatchStatMetricData,
  MatchType,
} from '@/types/match.types';

const base = (academyId: string) => `/academies/${academyId}/matches`;

export interface MatchFilters {
  teamId?: string;
  matchType?: MatchType;
  search?: string;
}

export async function getMatches(
  academyId: string,
  filters?: MatchFilters,
): Promise<MatchSummary[]> {
  const params = new URLSearchParams();
  if (filters?.teamId) params.set('teamId', filters.teamId);
  if (filters?.matchType) params.set('matchType', filters.matchType);
  if (filters?.search) params.set('search', filters.search);
  const query = params.toString();
  const url = query ? `${base(academyId)}?${query}` : base(academyId);
  const res = await api.get<ApiResponse<MatchSummary[]>>(url);
  return res.data.data;
}

export async function getMatchById(
  academyId: string,
  matchId: string,
): Promise<Match> {
  const res = await api.get<ApiResponse<Match>>(
    `${base(academyId)}/${matchId}`,
  );
  return res.data.data;
}

export async function createMatch(
  academyId: string,
  data: CreateMatchData,
): Promise<Match> {
  const res = await api.post<ApiResponse<Match>>(base(academyId), data);
  return res.data.data;
}

export async function updateMatch(
  academyId: string,
  matchId: string,
  data: UpdateMatchData,
): Promise<Match> {
  const res = await api.patch<ApiResponse<Match>>(
    `${base(academyId)}/${matchId}`,
    data,
  );
  return res.data.data;
}

export async function deleteMatch(
  academyId: string,
  matchId: string,
): Promise<void> {
  await api.delete(`${base(academyId)}/${matchId}`);
}

export async function saveMatchResults(
  academyId: string,
  matchId: string,
  data: SaveMatchResultsData,
): Promise<Match> {
  const res = await api.post<ApiResponse<Match>>(
    `${base(academyId)}/${matchId}/results`,
    data,
  );
  return res.data.data;
}

export async function getMetrics(academyId: string): Promise<MatchStatMetric[]> {
  const res = await api.get<ApiResponse<MatchStatMetric[]>>(
    `${base(academyId)}/metrics`,
  );
  return res.data.data;
}

export async function createMetric(
  academyId: string,
  data: CreateMatchStatMetricData,
): Promise<MatchStatMetric> {
  const res = await api.post<ApiResponse<MatchStatMetric>>(
    `${base(academyId)}/metrics`,
    data,
  );
  return res.data.data;
}

export async function updateMetric(
  academyId: string,
  metricId: string,
  data: UpdateMatchStatMetricData,
): Promise<MatchStatMetric> {
  const res = await api.patch<ApiResponse<MatchStatMetric>>(
    `${base(academyId)}/metrics/${metricId}`,
    data,
  );
  return res.data.data;
}

export async function getPlayerSeasonStats(
  academyId: string,
  playerId: string,
  filters?: { teamId?: string },
): Promise<PlayerSeasonSummary> {
  const params = new URLSearchParams();
  if (filters?.teamId) params.set('teamId', filters.teamId);
  const query = params.toString();
  const url = query
    ? `${base(academyId)}/players/${playerId}/season-stats?${query}`
    : `${base(academyId)}/players/${playerId}/season-stats`;
  const res = await api.get<ApiResponse<PlayerSeasonSummary>>(url);
  return res.data.data;
}
