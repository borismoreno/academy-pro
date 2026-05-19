import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/queryKeys";
import {
  getAcademy,
  updateAcademy,
  getMembers,
  inviteUser,
  getMetrics,
  createMetric,
  updateMetric,
  deleteMetric,
  getPendingInvitations,
  resendInvitation,
  cancelInvitation,
} from "@/services/settings.service";
import type {
  UpdateAcademyData,
  InviteUserData,
  CreateMetricData,
  UpdateMetricData,
} from "@/services/settings.service";

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message)
      return axiosError.response.data.message;
  }
  return "Ha ocurrido un error inesperado";
}

export function useSettings(isDirector = false) {
  const queryClient = useQueryClient();

  const { data: academy, isLoading: academyLoading } = useQuery({
    queryKey: queryKeys.settings.academy(),
    queryFn: getAcademy,
    enabled: isDirector,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: queryKeys.settings.members(),
    queryFn: () => getMembers(),
    enabled: isDirector,
  });

  const metricsQuery = useQuery({
    queryKey: queryKeys.settings.metrics(),
    queryFn: getMetrics,
    enabled: isDirector,
  });

  const {
    data: pendingInvitations = [],
    isLoading: pendingInvitationsLoading,
  } = useQuery({
    queryKey: queryKeys.settings.pendingInvitations(),
    queryFn: getPendingInvitations,
    enabled: isDirector,
  });

  const resendInvitationMutation = useMutation({
    mutationFn: (id: string) => resendInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.pendingInvitations() });
      toast({ description: "Invitación reenviada correctamente" });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: (id: string) => cancelInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.pendingInvitations() });
      toast({ description: "Invitación cancelada correctamente" });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const metrics = metricsQuery.data?.metrics ?? [];
  const isCustomMetricsEnabled =
    metricsQuery.data?.isCustomMetricsEnabled ?? true;
  const metricsLoading = metricsQuery.isLoading;

  const updateAcademyMutation = useMutation({
    mutationFn: (data: UpdateAcademyData) => updateAcademy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.academy() });
      toast({ description: "Información actualizada correctamente" });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: (data: InviteUserData) => inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.members() });
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.pendingInvitations() });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const createMetricMutation = useMutation({
    mutationFn: (data: CreateMetricData) => createMetric(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.metrics() });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const updateMetricMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMetricData }) =>
      updateMetric(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.metrics() });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const deleteMetricMutation = useMutation({
    mutationFn: (id: string) => deleteMetric(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.metrics() });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  return {
    academy,
    academyLoading,
    members,
    membersLoading,
    metrics,
    metricsLoading,
    isCustomMetricsEnabled,
    updateAcademyMutation,
    inviteUserMutation,
    createMetricMutation,
    updateMetricMutation,
    deleteMetricMutation,
    pendingInvitations,
    pendingInvitationsLoading,
    resendInvitationMutation,
    cancelInvitationMutation,
  };
}
