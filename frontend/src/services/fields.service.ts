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

export async function getFields(): Promise<FieldResponse[]> {
  const response = await api.get<ApiResponse<FieldResponse[]>>('/fields');
  return response.data.data;
}
