import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { fetchTeams, fetchPlayers } from '@/services/dashboard.service';
import { getMembers } from '@/services/settings.service';
import { getSessions, getSessionById } from '@/services/attendance.service';
import type { TeamResponse, PlayerResponse } from '@/services/dashboard.service';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UpcomingSession {
  id: string;
  teamName: string;
  fieldName: string | null;
  date: Date;
  startTime: string;
  playerCount: number;
}

export interface LowAttendancePlayer {
  id: string;
  fullName: string;
  teamName: string;
  position: string | null;
  attendancePercent: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STALE_5_MIN = 5 * 60 * 1000;

const DAY_NUM: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function computeUpcomingSessions(
  teams: TeamResponse[],
  players: PlayerResponse[],
): UpcomingSession[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const playerCountByTeam: Record<string, number> = {};
  for (const player of players) {
    if (player.isActive) {
      playerCountByTeam[player.teamId] = (playerCountByTeam[player.teamId] ?? 0) + 1;
    }
  }

  const sessions: UpcomingSession[] = [];

  for (const team of teams) {
    if (!team.isActive) continue;
    for (const schedule of team.schedules) {
      const targetDay = DAY_NUM[schedule.dayOfWeek];
      if (targetDay === undefined) continue;

      for (let i = 0; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        if (date.getDay() === targetDay) {
          sessions.push({
            id: `${schedule.id}-${date.toISOString().slice(0, 10)}`,
            teamName: team.name,
            fieldName: schedule.field?.name ?? null,
            date,
            startTime: schedule.startTime,
            playerCount: playerCountByTeam[team.id] ?? 0,
          });
          break;
        }
      }
    }
  }

  return sessions.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 3);
}

function getCurrentMonth(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDashboard() {
  const academyId = useAuthStore((s) => s.currentAcademyId);
  const role = useAuthStore((s) => s.role);

  const currentMonth = getCurrentMonth();

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary', academyId],
    queryFn: async () => {
      const [teams, players, coaches, sessions] = await Promise.all([
        fetchTeams(),
        fetchPlayers(),
        getMembers('coach'),
        getSessions({ month: currentMonth }),
      ]);

      const activeTeams = teams.filter((t) => t.isActive).length;
      const activePlayers = players.filter((p) => p.isActive).length;
      const activeCoaches = coaches.filter((c) => c.isActive).length;

      const totalPresent = sessions.reduce((s, sess) => s + sess.totalPresent, 0);
      const totalRecords = sessions.reduce(
        (s, sess) => s + sess.totalPresent + sess.totalAbsent,
        0,
      );
      const attendancePercent =
        totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

      const upcomingSessions = computeUpcomingSessions(teams, players);

      return {
        activeTeams,
        activePlayers,
        activeCoaches,
        attendancePercent,
        upcomingSessions,
      };
    },
    staleTime: STALE_5_MIN,
    enabled: !!academyId,
  });

  const lowAttendanceQuery = useQuery({
    queryKey: ['dashboard', 'low-attendance', academyId],
    queryFn: async () => {
      const sessions = await getSessions({ month: currentMonth });
      if (sessions.length === 0) return [];

      const fullSessions = await Promise.all(sessions.map((s) => getSessionById(s.id)));

      const playerStats: Record<
        string,
        {
          id: string;
          fullName: string;
          teamName: string;
          position: string | null;
          sessionCount: number;
          presentCount: number;
        }
      > = {};

      for (const session of fullSessions) {
        for (const record of session.records) {
          const key = record.playerId;
          if (!playerStats[key]) {
            playerStats[key] = {
              id: record.playerId,
              fullName: record.player.fullName,
              teamName: session.team.name,
              position: record.player.position,
              sessionCount: 0,
              presentCount: 0,
            };
          }
          playerStats[key].sessionCount++;
          if (record.present) playerStats[key].presentCount++;
        }
      }

      return Object.values(playerStats)
        .map((p) => ({
          id: p.id,
          fullName: p.fullName,
          teamName: p.teamName,
          position: p.position,
          attendancePercent:
            p.sessionCount > 0
              ? Math.round((p.presentCount / p.sessionCount) * 100)
              : 0,
        }))
        .filter((p) => p.attendancePercent < 60)
        .sort((a, b) => a.attendancePercent - b.attendancePercent);
    },
    staleTime: STALE_5_MIN,
    enabled: !!academyId,
  });

  return {
    activeTeams: summaryQuery.data?.activeTeams ?? 0,
    activePlayers: summaryQuery.data?.activePlayers ?? 0,
    activeCoaches: summaryQuery.data?.activeCoaches ?? 0,
    attendancePercent: summaryQuery.data?.attendancePercent ?? 0,
    upcomingSessions: summaryQuery.data?.upcomingSessions ?? [],
    lowAttendancePlayers: lowAttendanceQuery.data ?? [],
    isLoading: summaryQuery.isLoading,
    isError: summaryQuery.isError || lowAttendanceQuery.isError,
    role,
  };
}
