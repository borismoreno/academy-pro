import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryKeys';
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
    queryKey: queryKeys.attendance.session(id),
    queryFn: () => getSessionById(id),
    enabled: !!id,
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: BulkUpdateData) => bulkUpdateRecords(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.session(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.sessions() });
      // Invalidate all player attendance summaries since records changed
      queryClient.invalidateQueries({ queryKey: queryKeys.players.attendanceSummary() });
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
