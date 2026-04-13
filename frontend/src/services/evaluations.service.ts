import api from './api';
import type { ApiResponse, Evaluation, Metric, PlayerProgress } from '@/types';

export interface EvaluationFilters {
  playerId?: string;
  teamId?: string;
}

export interface ScoreItem {
  metricId: string;
  score: number;
}

export interface CreateEvaluationData {
  playerId: string;
  evaluatedAt: string;
  coachNotes?: string;
  scores: ScoreItem[];
}

export interface PlayerProgressFilters {
  from?: string;
  to?: string;
}

export async function getEvaluations(filters?: EvaluationFilters): Promise<Evaluation[]> {
  const params = new URLSearchParams();
  if (filters?.playerId) params.set('playerId', filters.playerId);
  if (filters?.teamId) params.set('teamId', filters.teamId);
  const query = params.toString();
  const response = await api.get<ApiResponse<Evaluation[]>>(
    query ? `/evaluations?${query}` : '/evaluations',
  );
  return response.data.data;
}

export async function getEvaluationById(id: string): Promise<Evaluation> {
  const response = await api.get<ApiResponse<Evaluation>>(`/evaluations/${id}`);
  return response.data.data;
}

export async function createEvaluation(data: CreateEvaluationData): Promise<Evaluation> {
  const response = await api.post<ApiResponse<Evaluation>>('/evaluations', data);
  return response.data.data;
}

export async function getMetrics(): Promise<Metric[]> {
  const response = await api.get<ApiResponse<{ metrics: Metric[]; isCustomMetricsEnabled: boolean }>>('/evaluations/metrics');
  return response.data.data.metrics;
}

export async function getPlayerProgress(
  playerId: string,
  filters?: PlayerProgressFilters,
): Promise<PlayerProgress> {
  const params = new URLSearchParams();
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  const query = params.toString();
  const response = await api.get<ApiResponse<PlayerProgress>>(
    query
      ? `/evaluations/players/${playerId}/progress?${query}`
      : `/evaluations/players/${playerId}/progress`,
  );
  return response.data.data;
}
