import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/auth.store';
import {
  getEvaluations,
  createEvaluation,
} from '@/services/evaluations.service';
import type { EvaluationFilters, CreateEvaluationData } from '@/services/evaluations.service';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

export function useEvaluations(filters?: EvaluationFilters) {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId);

  const { data: evaluations = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.evaluations.all(filters as Record<string, unknown> | undefined),
    queryFn: () => getEvaluations(filters),
  });

  const createEvaluationMutation = useMutation({
    mutationFn: (data: CreateEvaluationData) => createEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluations.all() });
      // Invalidate all player evaluation progress caches
      queryClient.invalidateQueries({ queryKey: queryKeys.players.evaluationProgress() });
      if (academyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(academyId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.lowAttendance(academyId) });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  return { evaluations, isLoading, isError, createEvaluationMutation };
}
