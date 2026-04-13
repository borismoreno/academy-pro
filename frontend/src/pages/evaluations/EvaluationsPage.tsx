import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { useAuthStore } from "@/store/auth.store";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers } from "@/hooks/usePlayers";
import { useEvaluations } from "@/hooks/useEvaluations";
import EvaluationCard from "./components/EvaluationCard";
import EvaluationFormSheet from "./components/EvaluationFormSheet";

const SELECT_CLASS =
  "bg-surface-high border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-[0.875rem] text-on-surface focus:outline-none focus:border-primary min-h-11 appearance-none cursor-pointer";

export default function EvaluationsPage() {
  const role = useAuthStore((s) => s.role);
  const [searchParams] = useSearchParams();

  const [sheetOpen, setSheetOpen] = useState(
    () => searchParams.get("action") === "create",
  );
  const [teamFilter, setTeamFilter] = useState("");
  const [playerFilter, setPlayerFilter] = useState(
    () => searchParams.get("playerId") ?? "",
  );

  const { teams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  // Filter players by selected team
  const { players } = usePlayers(
    teamFilter ? { teamId: teamFilter } : undefined,
  );
  const activePlayers = players.filter((p) => p.isActive);

  const filters = {
    playerId: playerFilter || undefined,
    teamId: teamFilter || undefined,
  };

  const { evaluations, isLoading } = useEvaluations(filters);

  const canEvaluate = role === "academy_director" || role === "coach";

  // Reset player filter when team changes
  function handleTeamChange(teamId: string) {
    setTeamFilter(teamId);
    setPlayerFilter("");
  }

  const sorted = [...evaluations].sort(
    (a, b) =>
      new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime(),
  );

  const defaultPlayerId = searchParams.get("playerId") ?? undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Evaluaciones"
        action={
          canEvaluate ? (
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 h-11 px-5 rounded-xl font-body font-semibold text-[0.875rem] bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap"
            >
              Nueva evaluación
            </button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={teamFilter}
          onChange={(e) => handleTeamChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">Todos los equipos</option>
          {activeTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={playerFilter}
          onChange={(e) => setPlayerFilter(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">Todos los jugadores</option>
          {activePlayers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          message="No hay evaluaciones registradas."
          icon={<ClipboardList size={48} />}
          action={
            canEvaluate ? (
              <button
                onClick={() => setSheetOpen(true)}
                className="flex items-center gap-2 h-11 px-5 rounded-xl font-body font-semibold text-[0.875rem] bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer"
              >
                Nueva evaluación
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {sorted.map((ev) => (
            <EvaluationCard key={ev.id} evaluation={ev} role={role} />
          ))}
        </div>
      )}

      <EvaluationFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        defaultPlayerId={defaultPlayerId}
      />
    </div>
  );
}
