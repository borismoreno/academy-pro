import { Users } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  usePortal,
  useGetPlayerPaymentRecords,
  useGetPlayerMatchHistory,
  useGetPlayerSeasonStats,
  isAxios403,
} from "@/hooks/usePortal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import PlayerSelector from "./components/PlayerSelector";
import PortalPlayerHero from "./components/PortalPlayerHero";
import PortalAttendanceSummary from "./components/PortalAttendanceSummary";
import PortalEvaluationSummary from "./components/PortalEvaluationSummary";
import PortalMatchesSummary from "./components/PortalMatchesSummary";
import PortalPaymentStatus from "./components/PortalPaymentStatus";
import PortalProgressChart from "./components/PortalProgressChart";
import PortalEvaluationDetail from "./components/PortalEvaluationDetail";
import PortalAttendanceDetail from "./components/PortalAttendanceDetail";
import PortalNextSession from "./components/PortalNextSession";

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0];
}

export default function PortalPage() {
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [evaluationOpen, setEvaluationOpen] = useState(false);

  const user = useAuthStore((state) => state.user);

  const {
    players,
    selectedPlayerId,
    setSelectedPlayerId,
    player,
    attendanceSummary,
    evaluationProgress,
    isLoadingPlayers,
    isLoadingDetail,
    isProgressForbidden,
    nextSession,
  } = usePortal();

  const paymentRecordsQuery = useGetPlayerPaymentRecords(selectedPlayerId);
  const matchHistoryQuery = useGetPlayerMatchHistory(selectedPlayerId);
  const seasonStatsQuery = useGetPlayerSeasonStats(
    selectedPlayerId,
    // disable season stats if match history is already forbidden
    !isAxios403(matchHistoryQuery.error),
  );

  const isMatchesForbidden =
    isAxios403(matchHistoryQuery.error) || isAxios403(seasonStatsQuery.error);

  const isLoadingMatches =
    matchHistoryQuery.isLoading || seasonStatsQuery.isLoading;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome header */}
      <div className="pb-4">
        <h1 className="font-display text-[1.75rem] font-semibold text-on-surface">
          Hola, {user ? getFirstName(user.fullName) : ""}
        </h1>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          Aquí está el progreso de tu hijo/a
        </p>
      </div>

      {/* Loading state */}
      {isLoadingPlayers && (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state — no linked players */}
      {!isLoadingPlayers && players.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <EmptyState
            icon={<Users size={48} />}
            message="Aún no tienes jugadores vinculados a tu cuenta."
          />
          <p className="font-body text-sm text-on-surface-variant max-w-xs -mt-2">
            El director de la academia debe vincular a tu hijo/a a tu perfil.
          </p>
        </div>
      )}

      {/* Main content — only when players are loaded */}
      {!isLoadingPlayers && players.length > 0 && (
        <>
          {/* Player selector — only when more than one child */}
          {players.length > 1 && (
            <PlayerSelector
              players={players}
              selectedPlayerId={selectedPlayerId}
              onSelect={setSelectedPlayerId}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PortalPlayerHero
              player={player}
              isLoading={isLoadingDetail}
              selectedPlayerId={selectedPlayerId ?? undefined}
            />
            <PortalNextSession
              nextSession={nextSession}
              isLoading={isLoadingDetail}
            />
          </div>

          {/* Payment status — all plans */}
          <PortalPaymentStatus
            records={paymentRecordsQuery.data}
            isLoading={paymentRecordsQuery.isLoading}
          />

          {/* Attendance + Evaluation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PortalAttendanceSummary
              summary={attendanceSummary}
              isLoading={isLoadingDetail}
              onClick={() => setAttendanceOpen(true)}
            />
            <PortalEvaluationSummary
              progress={evaluationProgress}
              isLoading={isLoadingDetail}
              isForbidden={isProgressForbidden}
              onClick={() => setEvaluationOpen(true)}
            />
          </div>

          {/* Progress chart */}
          <PortalProgressChart
            progress={evaluationProgress}
            isLoading={isLoadingDetail}
          />

          {/* Matches — Pro/Enterprise feature gate */}
          <PortalMatchesSummary
            matchHistory={matchHistoryQuery.data}
            seasonStats={seasonStatsQuery.data}
            isLoading={isLoadingMatches}
            isForbidden={isMatchesForbidden}
          />

          {/* Recent activity */}
          {/* <PortalRecentActivity
            attendanceSummary={attendanceSummary}
            evaluationProgress={evaluationProgress}
            paymentRecords={paymentRecordsQuery.data}
            matchHistory={
              isMatchesForbidden ? undefined : matchHistoryQuery.data
            }
            isLoading={isLoadingDetail}
          /> */}

          <PortalAttendanceDetail
            open={attendanceOpen}
            onOpenChange={setAttendanceOpen}
            summary={attendanceSummary}
          />
          <PortalEvaluationDetail
            open={evaluationOpen}
            onOpenChange={setEvaluationOpen}
            progress={evaluationProgress}
          />
        </>
      )}
    </div>
  );
}
