import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMyPlayers,
  getPlayerById,
  getAttendanceSummary,
  getEvaluationProgress,
  getNextSession,
  getPlayerPaymentRecords,
  getPlayerMatchHistory,
  getPlayerSeasonStats,
} from "@/services/portal.service";
import type {
  PlayerResponse,
  AttendanceSummary,
  EvaluationProgress,
  PortalPaymentRecord,
  PortalMatchEntry,
  PlayerSeasonSummary,
} from "@/services/portal.service";
import { useAuthStore } from "@/store/auth.store";

export type {
  PlayerResponse,
  AttendanceSummary,
  EvaluationProgress,
  PortalPaymentRecord,
  PortalMatchEntry,
  PlayerSeasonSummary,
};

export function isAxios403(error: unknown): boolean {
  if (error !== null && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 403;
  }
  return false;
}

export function usePortal() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const playersQuery = useQuery({
    queryKey: ["my-players"],
    queryFn: getMyPlayers,
  });

  const players = playersQuery.data ?? [];

  // Default to the first player once the list loads
  useEffect(() => {
    if (players.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(players[0].id);
    }
  }, [players, selectedPlayerId]);

  const playerQuery = useQuery({
    queryKey: ["portal-player", selectedPlayerId],
    queryFn: () => getPlayerById(selectedPlayerId!),
    enabled: !!selectedPlayerId,
  });

  const attendanceQuery = useQuery({
    queryKey: ["portal-attendance", selectedPlayerId],
    queryFn: () => getAttendanceSummary(selectedPlayerId!),
    enabled: !!selectedPlayerId,
  });

  const progressQuery = useQuery({
    queryKey: ["portal-progress", selectedPlayerId],
    queryFn: () => getEvaluationProgress(selectedPlayerId!),
    enabled: !!selectedPlayerId,
    retry: (failureCount, error) => {
      // Do not retry on 403 — it is an expected plan-gate response
      if (isAxios403(error)) return false;
      return failureCount < 3;
    },
  });

  const nextSessionQuery = useQuery({
    queryKey: ["portal-next-session", selectedPlayerId],
    queryFn: () => getNextSession(selectedPlayerId!),
    enabled: !!selectedPlayerId,
  });

  const isProgressForbidden = isAxios403(progressQuery.error);

  return {
    players,
    selectedPlayerId,
    setSelectedPlayerId,
    player: playerQuery.data,
    attendanceSummary: attendanceQuery.data,
    evaluationProgress: progressQuery.data,
    nextSession: nextSessionQuery.data,
    isLoadingPlayers: playersQuery.isLoading,
    isLoadingDetail:
      playerQuery.isLoading ||
      attendanceQuery.isLoading ||
      progressQuery.isLoading ||
      nextSessionQuery.isLoading,
    isProgressForbidden,
  };
}

export function useGetPlayerPaymentRecords(playerId: string | null) {
  const academyId = useAuthStore((s) => s.currentAcademyId);
  return useQuery<PortalPaymentRecord[]>({
    queryKey: ["portal-payments", academyId, playerId],
    queryFn: () => getPlayerPaymentRecords(academyId!, playerId!),
    enabled: !!playerId && !!academyId,
  });
}

export function useGetPlayerMatchHistory(playerId: string | null) {
  const academyId = useAuthStore((s) => s.currentAcademyId);
  return useQuery<PortalMatchEntry[]>({
    queryKey: ["portal-matches", academyId, playerId],
    queryFn: () => getPlayerMatchHistory(academyId!, playerId!),
    enabled: !!playerId && !!academyId,
    retry: (failureCount, error) => {
      if (isAxios403(error)) return false;
      return failureCount < 3;
    },
  });
}

export function useGetPlayerSeasonStats(
  playerId: string | null,
  enabled = true,
) {
  const academyId = useAuthStore((s) => s.currentAcademyId);
  return useQuery<PlayerSeasonSummary>({
    queryKey: ["portal-season-stats", academyId, playerId],
    queryFn: () => getPlayerSeasonStats(academyId!, playerId!),
    enabled: enabled && !!playerId && !!academyId,
    retry: (failureCount, error) => {
      if (isAxios403(error)) return false;
      return failureCount < 3;
    },
  });
}
