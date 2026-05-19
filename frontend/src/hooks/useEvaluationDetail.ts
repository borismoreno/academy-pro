import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getEvaluationById } from '@/services/evaluations.service';

export function useEvaluationDetail(id: string) {
  const { data: evaluation, isLoading, isError } = useQuery({
    queryKey: queryKeys.evaluations.detail(id),
    queryFn: () => getEvaluationById(id),
    enabled: !!id,
  });

  return { evaluation, isLoading, isError };
}
