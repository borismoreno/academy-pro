import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryKeys';
import {
  getStats,
  getAcademies,
  getAcademyById,
  createAcademy,
  updateSubscription,
  getPlanLimits,
  updatePlanLimit,
  getUsers,
} from '@/services/owner.service';
import type {
  CreateAcademyData,
  UpdateSubscriptionData,
  UpdatePlanLimitData,
} from '@/services/owner.service';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  return 'Ha ocurrido un error inesperado';
}

export function useOwnerStats() {
  return useQuery({
    queryKey: queryKeys.owner.stats(),
    queryFn: getStats,
  });
}

export function useOwnerAcademies(search?: string) {
  return useQuery({
    queryKey: queryKeys.owner.academies(search),
    queryFn: () => getAcademies(search),
  });
}

export function useOwnerAcademy(id: string) {
  return useQuery({
    queryKey: queryKeys.owner.academy(id),
    queryFn: () => getAcademyById(id),
    enabled: !!id,
  });
}

export function useOwnerPlanLimits() {
  return useQuery({
    queryKey: queryKeys.owner.planLimits(),
    queryFn: getPlanLimits,
  });
}

export function useOwnerUsers(search?: string) {
  return useQuery({
    queryKey: queryKeys.owner.users(search),
    queryFn: () => getUsers(search),
  });
}

export function useCreateAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAcademyData) => createAcademy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.academies() });
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.stats() });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateSubscription(academyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSubscriptionData) =>
      updateSubscription(academyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.academies() });
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.academy(academyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.stats() });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePlanLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanLimitData }) =>
      updatePlanLimit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.owner.planLimits() });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}
