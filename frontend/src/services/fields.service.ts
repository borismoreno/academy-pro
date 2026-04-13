import api from './api';
import type { ApiResponse } from '@/types';

export interface FieldResponse {
  id: string;
  academyId: string;
  name: string;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFieldData {
  name: string;
  location?: string;
}

export interface UpdateFieldData {
  name?: string;
  location?: string;
}

export async function getFields(): Promise<FieldResponse[]> {
  const response = await api.get<ApiResponse<FieldResponse[]>>('/fields');
  return response.data.data;
}

export async function createField(data: CreateFieldData): Promise<FieldResponse> {
  const response = await api.post<ApiResponse<FieldResponse>>('/fields', data);
  return response.data.data;
}

export async function updateField(id: string, data: UpdateFieldData): Promise<FieldResponse> {
  const response = await api.patch<ApiResponse<FieldResponse>>(`/fields/${id}`, data);
  return response.data.data;
}

export async function deleteField(id: string): Promise<void> {
  await api.delete(`/fields/${id}`);
}
