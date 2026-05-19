import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/auth.store";
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "@/services/players.service";
import type {
  CreatePlayerData,
  UpdatePlayerData,
} from "@/services/players.service";

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message)
      return axiosError.response.data.message;
  }
  return "Ha ocurrido un error inesperado";
}

interface PlayersFilters {
  teamId?: string;
  position?: string;
}

export function usePlayers(filters?: PlayersFilters) {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId);

  const {
    data: players = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.players.all(filters),
    queryFn: () => getPlayers(filters),
  });

  const invalidateDashboard = () => {
    if (!academyId) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.summary(academyId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.lowAttendance(academyId),
    });
  };

  const createPlayerMutation = useMutation({
    mutationFn: (data: CreatePlayerData) => createPlayer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.concepts(academyId!),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.concepts(academyId!, {
          teamId: filters?.teamId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.summary(academyId!),
      });
      invalidateDashboard();
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlayerData }) =>
      updatePlayer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all() });
      invalidateDashboard();
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players.all() });
      invalidateDashboard();
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
    players,
    isLoading,
    isError,
    createPlayerMutation,
    updatePlayerMutation,
    deletePlayerMutation,
  };
}
