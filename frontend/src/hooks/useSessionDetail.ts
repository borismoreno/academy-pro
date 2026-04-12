import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { getSessionById, bulkUpdateRecords } from '@/services/attendance.service';
import type { BulkUpdateData } from '@/services/attendance.service';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

export function useSessionDetail(id: string) {
  const queryClient = useQueryClient();

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['session', id],
    queryFn: () => getSessionById(id),
    enabled: !!id,
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: BulkUpdateData) => bulkUpdateRecords(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  return {
    session,
    records: session?.records ?? [],
    isLoading,
    isError,
    bulkUpdateMutation,
  };
}
