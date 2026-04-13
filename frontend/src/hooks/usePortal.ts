import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getMyPlayers,
  getPlayerById,
  getAttendanceSummary,
  getEvaluationProgress,
} from '@/services/portal.service';
import type { PlayerResponse, AttendanceSummary, EvaluationProgress } from '@/services/portal.service';

export type { PlayerResponse, AttendanceSummary, EvaluationProgress };

export function usePortal() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const playersQuery = useQuery({
    queryKey: ['my-players'],
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
    queryKey: ['portal-player', selectedPlayerId],
    queryFn: () => getPlayerById(selectedPlayerId!),
    enabled: !!selectedPlayerId,
  });

  const attendanceQuery = useQuery({
    queryKey: ['portal-attendance', selectedPlayerId],
    queryFn: () => getAttendanceSummary(selectedPlayerId!),
    enabled: !!selectedPlayerId,
  });

  const progressQuery = useQuery({
    queryKey: ['portal-progress', selectedPlayerId],
    queryFn: () => getEvaluationProgress(selectedPlayerId!),
    enabled: !!selectedPlayerId,
  });

  return {
    players,
    selectedPlayerId,
    setSelectedPlayerId,
    player: playerQuery.data,
    attendanceSummary: attendanceQuery.data,
    evaluationProgress: progressQuery.data,
    isLoadingPlayers: playersQuery.isLoading,
    isLoadingDetail:
      playerQuery.isLoading || attendanceQuery.isLoading || progressQuery.isLoading,
  };
}
