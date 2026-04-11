import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import {
  fetchTeams,
  fetchPlayers,
  fetchEvaluations,
  fetchAttendanceSessions,
} from '@/services/dashboard.service';
import type {
  TeamResponse,
  EvaluationResponse,
  SessionListResponse,
} from '@/services/dashboard.service';
import type { UserRole } from '@/types';

interface DashboardData {
  teams: TeamResponse[];
  totalPlayers: number;
  recentEvaluations: EvaluationResponse[];
  recentSessions: SessionListResponse[];
}

export function useDashboard() {
  const role = useAuthStore((state) => state.role);

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [teams, players, evaluations, sessions] = await Promise.all([
        fetchTeams(),
        fetchPlayers(),
        fetchEvaluations(),
        fetchAttendanceSessions(),
      ]);

      const recentEvaluations = [...evaluations]
        .sort(
          (a, b) =>
            new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime(),
        )
        .slice(0, 5);

      const recentSessions = [...sessions]
        .sort(
          (a, b) =>
            new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
        )
        .slice(0, 5);

      return {
        teams,
        totalPlayers: players.length,
        recentEvaluations,
        recentSessions,
      };
    },
  });

  return {
    teams: data?.teams ?? [],
    totalPlayers: data?.totalPlayers ?? 0,
    recentEvaluations: data?.recentEvaluations ?? [],
    recentSessions: data?.recentSessions ?? [],
    isLoading,
    isError,
    role: role as UserRole | null,
  };
}
