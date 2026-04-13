import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  getAcademy,
  updateAcademy,
  getMembers,
  inviteUser,
  getMetrics,
  createMetric,
  updateMetric,
  deleteMetric,
} from '@/services/settings.service';
import type {
  UpdateAcademyData,
  InviteUserData,
  CreateMetricData,
  UpdateMetricData,
} from '@/services/settings.service';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

export function useSettings(isDirector = false) {
  const queryClient = useQueryClient();

  const { data: academy, isLoading: academyLoading } = useQuery({
    queryKey: ['academy'],
    queryFn: getAcademy,
    enabled: isDirector,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMembers(),
    enabled: isDirector,
  });

  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: getMetrics,
    enabled: isDirector,
  });

  const updateAcademyMutation = useMutation({
    mutationFn: (data: UpdateAcademyData) => updateAcademy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy'] });
      toast({ description: 'Información actualizada correctamente' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: (data: InviteUserData) => inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const createMetricMutation = useMutation({
    mutationFn: (data: CreateMetricData) => createMetric(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const updateMetricMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMetricData }) =>
      updateMetric(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const deleteMetricMutation = useMutation({
    mutationFn: (id: string) => deleteMetric(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  return {
    academy,
    academyLoading,
    members,
    membersLoading,
    metrics,
    metricsLoading,
    updateAcademyMutation,
    inviteUserMutation,
    createMetricMutation,
    updateMetricMutation,
    deleteMetricMutation,
  };
}
