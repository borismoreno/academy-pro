import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from '@/services/attendance.service';
import type {
  CreateSessionData,
  UpdateSessionData,
  SessionFilters,
} from '@/services/attendance.service';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

export function useAttendance(filters?: SessionFilters) {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => getSessions(filters),
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: CreateSessionData) => createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionData }) =>
      updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: unknown) => {
      toast({ title: 'Error', description: extractErrorMessage(error), variant: 'destructive' });
    },
  });

  return {
    sessions,
    isLoading,
    isError,
    createSessionMutation,
    updateSessionMutation,
    deleteSessionMutation,
  };
}
