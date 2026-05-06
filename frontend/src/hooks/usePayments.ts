import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth.store";
import {
  getConcepts,
  getConceptById,
  createConcept,
  updateRecord,
  getPaymentSummary,
} from "@/services/payment.service";
import type {
  CreatePaymentConceptData,
  UpdatePaymentRecordData,
} from "@/types/payment.types";

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message)
      return axiosError.response.data.message;
  }
  return "Ha ocurrido un error inesperado";
}

interface ConceptsFilters {
  teamId?: string;
  search?: string;
}

export function useGetConcepts(filters?: ConceptsFilters) {
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? "";

  return useQuery({
    queryKey: ["payments", "concepts", academyId, filters],
    queryFn: () => getConcepts(academyId, filters),
    enabled: !!academyId,
  });
}

export function useGetConcept(conceptId: string) {
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? "";

  return useQuery({
    queryKey: ["payments", "concept", conceptId],
    queryFn: () => getConceptById(academyId, conceptId),
    enabled: !!academyId && !!conceptId,
  });
}

export function useCreateConcept() {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? "";

  return useMutation({
    mutationFn: (data: CreatePaymentConceptData) =>
      createConcept(academyId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["payments", "concepts", academyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payments", "summary", academyId],
      });
      toast({
        description: `Concepto creado. Se generaron ${result.recordsCreated} registros de pago.`,
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useUpdateRecord(conceptId?: string) {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? "";

  return useMutation({
    mutationFn: ({
      recordId,
      data,
    }: {
      recordId: string;
      data: UpdatePaymentRecordData;
    }) => updateRecord(academyId, recordId, data),
    onSuccess: () => {
      if (conceptId) {
        queryClient.invalidateQueries({
          queryKey: ["payments", "concept", conceptId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["payments", "concepts", academyId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payments", "summary", academyId],
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useGetPaymentSummary() {
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? "";

  return useQuery({
    queryKey: ["payments", "summary", academyId],
    queryFn: () => getPaymentSummary(academyId),
    enabled: !!academyId,
  });
}
