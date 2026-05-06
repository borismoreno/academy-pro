import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth.store';
import {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  saveMatchResults,
  getMetrics,
  createMetric,
  updateMetric,
  getPlayerSeasonStats,
} from '@/services/match.service';
import type { MatchFilters } from '@/services/match.service';
import type {
  CreateMatchData,
  UpdateMatchData,
  SaveMatchResultsData,
  CreateMatchStatMetricData,
  UpdateMatchStatMetricData,
} from '@/types/match.types';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { data?: { message?: string } } };
    if (e.response?.data?.message) return e.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

export function useGetMatches(filters?: MatchFilters) {
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useQuery({
    queryKey: ['matches', academyId, filters],
    queryFn: () => getMatches(academyId, filters),
    enabled: !!academyId,
  });
}

export function useGetMatch(matchId: string) {
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => getMatchById(academyId, matchId),
    enabled: !!academyId && !!matchId,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useMutation({
    mutationFn: (data: CreateMatchData) => createMatch(academyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', academyId] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: UpdateMatchData }) =>
      updateMatch(academyId, matchId, data),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches', academyId] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useMutation({
    mutationFn: (matchId: string) => deleteMatch(academyId, matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', academyId] });
      toast({ title: 'Encuentro eliminado' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useSaveMatchResults() {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: SaveMatchResultsData }) =>
      saveMatchResults(academyId, matchId, data),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useGetMetrics() {
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useQuery({
    queryKey: ['match-metrics', academyId],
    queryFn: () => getMetrics(academyId),
    enabled: !!academyId,
  });
}

export function useCreateMetric() {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useMutation({
    mutationFn: (data: CreateMatchStatMetricData) => createMetric(academyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-metrics', academyId] });
      toast({ title: 'Métrica creada' });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateMetric() {
  const queryClient = useQueryClient();
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useMutation({
    mutationFn: ({ metricId, data }: { metricId: string; data: UpdateMatchStatMetricData }) =>
      updateMetric(academyId, metricId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-metrics', academyId] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });
}

export function useGetPlayerSeasonStats(
  playerId: string,
  filters?: { teamId?: string },
) {
  const academyId = useAuthStore((s) => s.currentAcademyId) ?? '';
  return useQuery({
    queryKey: ['player-season-stats', playerId, filters],
    queryFn: () => getPlayerSeasonStats(academyId, playerId, filters),
    enabled: !!academyId && !!playerId,
  });
}
