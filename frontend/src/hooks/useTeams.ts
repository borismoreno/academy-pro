import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/auth.store';
import {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from '@/services/teams.service';
import type { CreateTeamData, UpdateTeamData } from '@/services/teams.service';

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

export function useTeams() {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId);

  const { data: teams = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.teams.all(),
    queryFn: getTeams,
  });

  const invalidateDashboard = () => {
    if (!academyId) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(academyId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.lowAttendance(academyId) });
  };

  const createTeamMutation = useMutation({
    mutationFn: (data: CreateTeamData) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
      invalidateDashboard();
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamData }) => updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
      invalidateDashboard();
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
      invalidateDashboard();
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  return {
    teams,
    isLoading,
    isError,
    createTeamMutation,
    updateTeamMutation,
    deleteTeamMutation,
  };
}
