import api from './api';
import type { ApiResponse, Session, SessionListItem, PlayerAttendanceSummary } from '@/types';

export interface CreateSessionData {
  teamId: string;
  sessionDate: string;
  notes?: string;
}

export interface UpdateSessionData {
  notes?: string;
}

export interface BulkUpdateRecord {
  playerId: string;
  present: boolean;
}

export interface BulkUpdateData {
  records: BulkUpdateRecord[];
}

export interface SessionFilters {
  teamId?: string;
  month?: string;
}

export async function getSessions(filters?: SessionFilters): Promise<SessionListItem[]> {
  const params = new URLSearchParams();
  if (filters?.teamId) params.append('teamId', filters.teamId);
  if (filters?.month) params.append('month', filters.month);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get<ApiResponse<SessionListItem[]>>(`/attendance/sessions${query}`);
  return response.data.data;
}

export async function getSessionById(id: string): Promise<Session> {
  const response = await api.get<ApiResponse<Session>>(`/attendance/sessions/${id}`);
  return response.data.data;
}

export async function createSession(data: CreateSessionData): Promise<Session> {
  const response = await api.post<ApiResponse<Session>>('/attendance/sessions', data);
  return response.data.data;
}

export async function updateSession(id: string, data: UpdateSessionData): Promise<Session> {
  const response = await api.patch<ApiResponse<Session>>(`/attendance/sessions/${id}`, data);
  return response.data.data;
}

export async function deleteSession(id: string): Promise<void> {
  await api.delete(`/attendance/sessions/${id}`);
}

export async function bulkUpdateRecords(sessionId: string, data: BulkUpdateData): Promise<Session> {
  const response = await api.patch<ApiResponse<Session>>(
    `/attendance/sessions/${sessionId}/records`,
    data,
  );
  return response.data.data;
}

export async function getPlayerSummary(
  playerId: string,
  filters?: { month?: string },
): Promise<PlayerAttendanceSummary> {
  const params = new URLSearchParams();
  if (filters?.month) params.append('month', filters.month);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get<ApiResponse<PlayerAttendanceSummary>>(
    `/attendance/players/${playerId}/summary${query}`,
  );
  return response.data.data;
}
