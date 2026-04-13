import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  getFields,
  createField,
  updateField,
  deleteField,
} from '@/services/fields.service';
import type { CreateFieldData, UpdateFieldData } from '@/services/fields.service';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

export function useFields() {
  const queryClient = useQueryClient();

  const {
    data: fields = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['fields'],
    queryFn: getFields,
  });

  const createFieldMutation = useMutation({
    mutationFn: (data: CreateFieldData) => createField(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFieldData }) =>
      updateField(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: (id: string) => deleteField(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
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
    fields,
    isLoading,
    isError,
    createFieldMutation,
    updateFieldMutation,
    deleteFieldMutation,
  };
}
