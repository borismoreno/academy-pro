import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMyPlayers,
  getPlayerById,
  getAttendanceSummary,
  getEvaluationProgress,
  getNextSession,
} from "@/services/portal.service";
import type {
  PlayerResponse,
  AttendanceSummary,
  EvaluationProgress,
} from "@/services/portal.service";

export type { PlayerResponse, AttendanceSummary, EvaluationProgress };

function isAxios403(error: unknown): boolean {
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
