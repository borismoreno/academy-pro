import api from './api';
import type { ApiResponse } from '@/types';

// ---------------------------------------------------------------------------
// Response type definitions — mirror backend DTOs exactly
// ---------------------------------------------------------------------------

export interface CoachUser {
  id: string;
  fullName: string;
  email: string;
}

export interface TeamCoach {
  id: string;
  teamId: string;
  userId: string;
  isPrimary: boolean;
  createdAt: string;
  user: CoachUser;
}

export interface ScheduleFieldInfo {
  id: string;
  name: string;
  location: string | null;
}

export interface TeamSchedule {
  id: string;
  teamId: string;
  fieldId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  field: ScheduleFieldInfo;
}

export interface TeamResponse {
  id: string;
  academyId: string;
  name: string;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  coaches: TeamCoach[];
  schedules: TeamSchedule[];
}

export interface PlayerTeamInfo {
  id: string;
  name: string;
  category: string | null;
}

export interface PlayerResponse {
  id: string;
  academyId: string;
  teamId: string;
  fullName: string;
  birthDate: string;
  position: string | null;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  team: PlayerTeamInfo;
}

export interface EvaluationScore {
  id: string;
  metricId: string;
  metricName: string;
  score: number;
}

export interface EvaluationPlayerInfo {
  id: string;
  fullName: string;
  position: string | null;
  teamId: string;
}

export interface EvaluationCoachInfo {
  id: string;
  fullName: string;
}

export interface EvaluationResponse {
  id: string;
  playerId: string;
  coachId: string;
  evaluatedAt: string;
  coachNotes: string | null;
  createdAt: string;
  player: EvaluationPlayerInfo;
  coach: EvaluationCoachInfo;
  scores: EvaluationScore[];
}

export interface SessionTeamInfo {
  id: string;
  name: string;
}

export interface SessionListResponse {
  id: string;
  teamId: string;
  coachId: string;
  sessionDate: string;
  notes: string | null;
  createdAt: string;
  team: SessionTeamInfo;
  totalPresent: number;
  totalAbsent: number;
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

export async function fetchTeams(): Promise<TeamResponse[]> {
  const response = await api.get<ApiResponse<TeamResponse[]>>('/teams');
  return response.data.data;
}

export async function fetchPlayers(): Promise<PlayerResponse[]> {
  const response = await api.get<ApiResponse<PlayerResponse[]>>('/players');
  return response.data.data;
}

export async function fetchEvaluations(): Promise<EvaluationResponse[]> {
  const response = await api.get<ApiResponse<EvaluationResponse[]>>('/evaluations');
  return response.data.data;
}

export async function fetchAttendanceSessions(): Promise<SessionListResponse[]> {
  const response = await api.get<ApiResponse<SessionListResponse[]>>('/attendance/sessions');
  return response.data.data;
}
