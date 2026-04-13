import api from './api';
import type { ApiResponse, Academy, Member, Metric } from '@/types';

// ── Academy ───────────────────────────────────────────────────────────────────

export async function getAcademy(): Promise<Academy> {
  const response = await api.get<ApiResponse<Academy>>('/academies/me');
  return response.data.data;
}

export interface UpdateAcademyData {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

export async function updateAcademy(data: UpdateAcademyData): Promise<Academy> {
  const response = await api.patch<ApiResponse<Academy>>('/academies/me', data);
  return response.data.data;
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function getMembers(role?: string): Promise<Member[]> {
  const params = role ? `?role=${role}` : '';
  const response = await api.get<ApiResponse<Member[]>>(`/academies/members${params}`);
  return response.data.data;
}

// ── Invitations ───────────────────────────────────────────────────────────────

export interface InviteUserData {
  email: string;
  role: 'coach' | 'parent';
  playerId?: string;
}

export async function inviteUser(data: InviteUserData): Promise<void> {
  await api.post('/invitations', data);
}

// ── Evaluation Metrics ────────────────────────────────────────────────────────

export interface MetricsListResponse {
  metrics: Metric[];
  isCustomMetricsEnabled: boolean;
}

export async function getMetrics(): Promise<MetricsListResponse> {
  const response = await api.get<ApiResponse<MetricsListResponse>>('/evaluations/metrics');
  return response.data.data;
}

export interface CreateMetricData {
  metricName: string;
  sortOrder: number;
}

export async function createMetric(data: CreateMetricData): Promise<Metric> {
  const response = await api.post<ApiResponse<Metric>>('/evaluations/metrics', data);
  return response.data.data;
}

export interface UpdateMetricData {
  metricName?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export async function updateMetric(id: string, data: UpdateMetricData): Promise<Metric> {
  const response = await api.patch<ApiResponse<Metric>>(`/evaluations/metrics/${id}`, data);
  return response.data.data;
}

export async function deleteMetric(id: string): Promise<void> {
  await api.delete(`/evaluations/metrics/${id}`);
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface UpdateProfileData {
  fullName: string;
}

export async function updateProfile(
  data: UpdateProfileData,
): Promise<{ fullName: string; email: string }> {
  const response = await api.patch<ApiResponse<{ fullName: string; email: string }>>(
    '/auth/me',
    data,
  );
  return response.data.data;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
  await api.patch('/auth/me/password', data);
}
