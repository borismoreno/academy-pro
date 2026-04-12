import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  getTeamById,
  addCoach,
  removeCoach,
  addSchedule,
  removeSchedule,
} from '@/services/teams.service';
import type { AddCoachData, AddScheduleData } from '@/services/teams.service';

function extractErrorMessage(error: unknown): string {
  if (
    error !== null &&
    typeof error === 'object' &&
    'response' in error
  ) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  return 'Ha ocurrido un error inesperado';
}

export function useTeamDetail(id: string) {
  const queryClient = useQueryClient();

  const { data: team, isLoading, isError } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id),
    enabled: !!id,
  });

  const addCoachMutation = useMutation({
    mutationFn: (data: AddCoachData) => addCoach(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  const removeCoachMutation = useMutation({
    mutationFn: (userId: string) => removeCoach(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  const addScheduleMutation = useMutation({
    mutationFn: (data: AddScheduleData) => addSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  const removeScheduleMutation = useMutation({
    mutationFn: (scheduleId: string) => removeSchedule(id, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  return {
    team,
    isLoading,
    isError,
    addCoachMutation,
    removeCoachMutation,
    addScheduleMutation,
    removeScheduleMutation,
  };
}
