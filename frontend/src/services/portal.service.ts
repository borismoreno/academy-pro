import api from './api';
import type { ApiResponse } from '@/types';
import type {
  PlayerResponse,
  AttendanceSummary,
  EvaluationProgress,
} from './players.service';

export type { PlayerResponse, AttendanceSummary, EvaluationProgress };

/**
 * Returns all players linked to the authenticated parent via player_parents.
 * Backend enforces the parent filter — only children linked to this user are returned.
 */
export async function getMyPlayers(): Promise<PlayerResponse[]> {
  const response = await api.get<ApiResponse<PlayerResponse[]>>('/players');
  return response.data.data;
}

export async function getPlayerById(id: string): Promise<PlayerResponse> {
  const response = await api.get<ApiResponse<PlayerResponse>>(`/players/${id}`);
  return response.data.data;
}

export async function getAttendanceSummary(playerId: string): Promise<AttendanceSummary> {
  const response = await api.get<ApiResponse<AttendanceSummary>>(
    `/attendance/players/${playerId}/summary`,
  );
  return response.data.data;
}

export async function getEvaluationProgress(playerId: string): Promise<EvaluationProgress> {
  const response = await api.get<ApiResponse<EvaluationProgress>>(
    `/evaluations/players/${playerId}/progress`,
  );
  return response.data.data;
}
