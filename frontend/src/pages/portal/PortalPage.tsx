import { Users } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usePortal } from "@/hooks/usePortal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import PlayerSelector from "./components/PlayerSelector";
import PortalPlayerHero from "./components/PortalPlayerHero";
import PortalAttendanceSummary from "./components/PortalAttendanceSummary";
import PortalEvaluationSummary from "./components/PortalEvaluationSummary";
import PortalRecentActivity from "./components/PortalRecentActivity";
import PortalProgressChart from "./components/PortalProgressChart";
import { useState } from "react";
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

          {/* Player hero */}
          <PortalPlayerHero
            player={player}
            isLoading={isLoadingDetail}
            selectedPlayerId={selectedPlayerId ?? undefined}
          />
          <PortalNextSession
            nextSession={nextSession}
            isLoading={isLoadingDetail}
          />

          {/* Stats grid — 2 columns */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Progress chart — full width */}
          <PortalProgressChart
            progress={evaluationProgress}
            isLoading={isLoadingDetail}
          />

          {/* Recent activity — full width */}
          <PortalRecentActivity
            attendanceSummary={attendanceSummary}
            evaluationProgress={evaluationProgress}
            isLoading={isLoadingDetail}
          />
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
