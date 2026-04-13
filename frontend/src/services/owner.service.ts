import api from './api';
import type {
  ApiResponse,
  OwnerStats,
  AcademyWithSubscription,
  AcademyDetail,
  PlanLimitsGrouped,
  PlanLimit,
  OwnerUser,
  AcademySubscription,
} from '@/types';

export interface CreateAcademyData {
  name: string;
  city: string;
  directorEmail: string;
  directorName: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateSubscriptionData {
  plan?: 'free' | 'pro' | 'enterprise';
  status?: 'active' | 'suspended' | 'cancelled';
  startsAt?: string;
  endsAt?: string;
}

export interface UpdatePlanLimitData {
  maxCount: number;
}

export async function getStats(): Promise<OwnerStats> {
  const res = await api.get<ApiResponse<OwnerStats>>('/owner/stats');
  return res.data.data;
}

export async function getAcademies(search?: string): Promise<AcademyWithSubscription[]> {
  const params = search ? { search } : undefined;
  const res = await api.get<ApiResponse<AcademyWithSubscription[]>>('/owner/academies', { params });
  return res.data.data;
}

export async function getAcademyById(id: string): Promise<AcademyDetail> {
  const res = await api.get<ApiResponse<AcademyDetail>>(`/owner/academies/${id}`);
  return res.data.data;
}

export async function createAcademy(data: CreateAcademyData): Promise<AcademyWithSubscription> {
  const res = await api.post<ApiResponse<AcademyWithSubscription>>('/owner/academies', data);
  return res.data.data;
}

export async function updateSubscription(
  academyId: string,
  data: UpdateSubscriptionData,
): Promise<AcademySubscription> {
  const res = await api.patch<ApiResponse<AcademySubscription>>(
    `/owner/academies/${academyId}/subscription`,
    data,
  );
  return res.data.data;
}

export async function getPlanLimits(): Promise<PlanLimitsGrouped> {
  const res = await api.get<ApiResponse<PlanLimitsGrouped>>('/owner/plan-limits');
  return res.data.data;
}

export async function updatePlanLimit(
  id: string,
  data: UpdatePlanLimitData,
): Promise<PlanLimit> {
  const res = await api.patch<ApiResponse<PlanLimit>>(`/owner/plan-limits/${id}`, data);
  return res.data.data;
}

export async function getUsers(search?: string): Promise<OwnerUser[]> {
  const params = search ? { search } : undefined;
  const res = await api.get<ApiResponse<OwnerUser[]>>('/owner/users', { params });
  return res.data.data;
}
