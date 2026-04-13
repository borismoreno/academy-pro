import { useQuery } from '@tanstack/react-query';
import { getEvaluationById } from '@/services/evaluations.service';

export function useEvaluationDetail(id: string) {
  const { data: evaluation, isLoading, isError } = useQuery({
    queryKey: ['evaluation', id],
    queryFn: () => getEvaluationById(id),
    enabled: !!id,
  });

  return { evaluation, isLoading, isError };
}
