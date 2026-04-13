import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
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

  const { data: evaluations = [], isLoading, isError } = useQuery({
    queryKey: ['evaluations', filters],
    queryFn: () => getEvaluations(filters),
  });

  const createEvaluationMutation = useMutation({
    mutationFn: (data: CreateEvaluationData) => createEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
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
