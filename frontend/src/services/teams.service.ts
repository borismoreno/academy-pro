import api from './api';
import type { ApiResponse } from '@/types';
import type { TeamResponse, TeamCoach, TeamSchedule } from './dashboard.service';

export interface CreateTeamData {
  name: string;
  category: string;
}

export interface UpdateTeamData {
  name?: string;
  category?: string;
}

export interface AddCoachData {
  userId: string;
  isPrimary?: boolean;
}

export interface AddScheduleData {
  fieldId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export async function getTeams(): Promise<TeamResponse[]> {
  const response = await api.get<ApiResponse<TeamResponse[]>>('/teams');
  return response.data.data;
}

export async function getTeamById(id: string): Promise<TeamResponse> {
  const response = await api.get<ApiResponse<TeamResponse>>(`/teams/${id}`);
  return response.data.data;
}

export async function createTeam(data: CreateTeamData): Promise<TeamResponse> {
  const response = await api.post<ApiResponse<TeamResponse>>('/teams', data);
  return response.data.data;
}

export async function updateTeam(id: string, data: UpdateTeamData): Promise<TeamResponse> {
  const response = await api.patch<ApiResponse<TeamResponse>>(`/teams/${id}`, data);
  return response.data.data;
}

export async function deleteTeam(id: string): Promise<void> {
  await api.delete(`/teams/${id}`);
}

export async function addCoach(teamId: string, data: AddCoachData): Promise<TeamCoach> {
  const response = await api.post<ApiResponse<TeamCoach>>(`/teams/${teamId}/coaches`, data);
  return response.data.data;
}

export async function removeCoach(teamId: string, userId: string): Promise<void> {
  await api.delete(`/teams/${teamId}/coaches/${userId}`);
}

export async function addSchedule(teamId: string, data: AddScheduleData): Promise<TeamSchedule> {
  const response = await api.post<ApiResponse<TeamSchedule>>(`/teams/${teamId}/schedules`, data);
  return response.data.data;
}

export async function removeSchedule(teamId: string, scheduleId: string): Promise<void> {
  await api.delete(`/teams/${teamId}/schedules/${scheduleId}`);
}
