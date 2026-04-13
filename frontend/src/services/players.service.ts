import api from './api';
import type { ApiResponse } from '@/types';
import type { PlayerResponse } from './dashboard.service';

export type { PlayerResponse };

export interface PlayerParent {
  id: string;
  playerId: string;
  userId: string;
  relationship: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface PlayerWithParents extends PlayerResponse {
  parents?: PlayerParent[];
}

export interface AttendanceSummaryItem {
  sessionId: string;
  sessionDate: string;
  present: boolean;
}

export interface AttendanceSummary {
  playerId: string;
  totalSessions: number;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
  sessions: AttendanceSummaryItem[];
}

export interface EvaluationScoreItem {
  id: string;
  metricId: string;
  metricName: string;
  score: number;
}

export interface EvaluationProgressItem {
  evaluatedAt: string;
  coachNotes: string | null;
  scores: EvaluationScoreItem[];
}

export interface EvaluationProgress {
  player: {
    id: string;
    fullName: string;
    position: string | null;
    teamId: string;
  };
  evaluations: EvaluationProgressItem[];
}

export interface CreatePlayerData {
  fullName: string;
  birthDate: string;
  position: string;
  teamId: string;
}

export interface UpdatePlayerData {
  fullName?: string;
  birthDate?: string;
  position?: string;
  teamId?: string;
}

export interface AddParentData {
  userId: string;
  relationship: string;
}

export async function getPlayers(filters?: {
  teamId?: string;
  position?: string;
}): Promise<PlayerResponse[]> {
  const params = new URLSearchParams();
  if (filters?.teamId) params.set('teamId', filters.teamId);
  if (filters?.position) params.set('position', filters.position);
  const query = params.toString();
  const response = await api.get<ApiResponse<PlayerResponse[]>>(
    query ? `/players?${query}` : '/players',
  );
  return response.data.data;
}

export async function getPlayerById(id: string): Promise<PlayerWithParents> {
  const response = await api.get<ApiResponse<PlayerWithParents>>(`/players/${id}`);
  return response.data.data;
}

export async function createPlayer(data: CreatePlayerData): Promise<PlayerResponse> {
  const response = await api.post<ApiResponse<PlayerResponse>>('/players', data);
  return response.data.data;
}

export async function updatePlayer(id: string, data: UpdatePlayerData): Promise<PlayerResponse> {
  const response = await api.patch<ApiResponse<PlayerResponse>>(`/players/${id}`, data);
  return response.data.data;
}

export async function updatePlayerPhoto(id: string, photoUrl: string): Promise<PlayerResponse> {
  const response = await api.patch<ApiResponse<PlayerResponse>>(`/players/${id}`, { photoUrl });
  return response.data.data;
}

export async function deletePlayer(id: string): Promise<void> {
  await api.delete(`/players/${id}`);
}

export async function addParent(playerId: string, data: AddParentData): Promise<PlayerParent> {
  const response = await api.post<ApiResponse<PlayerParent>>(
    `/players/${playerId}/parents`,
    data,
  );
  return response.data.data;
}

export async function removeParent(playerId: string, userId: string): Promise<void> {
  await api.delete(`/players/${playerId}/parents/${userId}`);
}

export async function getPlayerAttendanceSummary(
  playerId: string,
): Promise<AttendanceSummary> {
  const response = await api.get<ApiResponse<AttendanceSummary>>(
    `/attendance/players/${playerId}/summary`,
  );
  return response.data.data;
}

export async function getPlayerEvaluationProgress(
  playerId: string,
): Promise<EvaluationProgress> {
  const response = await api.get<ApiResponse<EvaluationProgress>>(
    `/evaluations/players/${playerId}/progress`,
  );
  return response.data.data;
}
