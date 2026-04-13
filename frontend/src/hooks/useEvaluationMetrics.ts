import { useQuery } from '@tanstack/react-query';
import { getMetrics } from '@/services/evaluations.service';

export function useEvaluationMetrics() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['evaluation-metrics'],
    queryFn: getMetrics,
    staleTime: 5 * 60 * 1000,
  });

  return { metrics, isLoading };
}
