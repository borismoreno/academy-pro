import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  getPlayerById,
  getPlayerAttendanceSummary,
  getPlayerEvaluationProgress,
  addParent,
  removeParent,
} from '@/services/players.service';
import type { AddParentData } from '@/services/players.service';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

export function usePlayerDetail(id: string) {
  const queryClient = useQueryClient();

  // All three queries run in parallel — React Query fires them concurrently
  const playerQuery = useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayerById(id),
    enabled: !!id,
  });

  const attendanceQuery = useQuery({
    queryKey: ['player-attendance', id],
    queryFn: () => getPlayerAttendanceSummary(id),
    enabled: !!id,
  });

  const evaluationQuery = useQuery({
    queryKey: ['player-evaluations', id],
    queryFn: () => getPlayerEvaluationProgress(id),
    enabled: !!id,
  });

  const addParentMutation = useMutation({
    mutationFn: (data: AddParentData) => addParent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', id] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const removeParentMutation = useMutation({
    mutationFn: (userId: string) => removeParent(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player', id] });
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
    player: playerQuery.data,
    attendanceSummary: attendanceQuery.data,
    evaluationProgress: evaluationQuery.data,
    isLoading:
      playerQuery.isLoading ||
      attendanceQuery.isLoading ||
      evaluationQuery.isLoading,
    isError: playerQuery.isError,
    addParentMutation,
    removeParentMutation,
  };
}
