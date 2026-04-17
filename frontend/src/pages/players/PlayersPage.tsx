import { useState } from "react";
import { Users } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { usePlayers } from "@/hooks/usePlayers";
import { useTeams } from "@/hooks/useTeams";
import { useAuthStore } from "@/store/auth.store";
import PlayerCard from "./components/PlayerCard";
import PlayerFormSheet from "./components/PlayerFormSheet";
import { SearchableSelect } from "@/components/shared/SearchableSelect";

const POSITIONS = [
  { value: "", label: "Todas las posiciones" },
  { value: "Portero", label: "Portero" },
  { value: "Defensa", label: "Defensa" },
  { value: "Mediocampista", label: "Mediocampista" },
  { value: "Delantero", label: "Delantero" },
];

const FILTER_SELECT_CLASS =
  "bg-surface-high border border-outline-variant/15 rounded-xl px-3 py-2 font-body text-sm text-on-surface-variant focus:outline-none focus:border-primary min-h-11 appearance-none cursor-pointer";

export default function PlayersPage() {
  const role = useAuthStore((state) => state.role);
  const canAdd = role === "academy_director";

  const [teamFilter, setTeamFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filters = {
    ...(teamFilter ? { teamId: teamFilter } : {}),
    ...(positionFilter ? { position: positionFilter } : {}),
  };

  const { players, isLoading } = usePlayers(
    Object.keys(filters).length > 0 ? filters : undefined,
  );
  const { teams, isLoading: isLoadingTeams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  function handleTeamChange(teamId: string) {
    setTeamFilter(teamId);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title=""
        action={
          canAdd ? (
            <Button
              variant="primary"
              onClick={() => setCreateOpen(true)}
              className="min-h-11"
            >
              Agregar jugador
            </Button>
          ) : undefined
        }
      />

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="w-full sm:w-56">
          <SearchableSelect
            options={[
              { value: "all", label: "Todos los equipos" },
              ...activeTeams.map((t) => ({
                value: t.id,
                label: t.name,
                subtitle: t.category ?? undefined,
              })),
            ]}
            value={teamFilter || "all"}
            onValueChange={(val) => handleTeamChange(val === "all" ? "" : val)}
            placeholder="Todos los equipos"
            searchPlaceholder="Buscar equipo..."
            isLoading={isLoadingTeams}
          />
        </div>
        {/* <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className={FILTER_SELECT_CLASS}
        >
          <option value="">Todos los equipos</option>
          {activeTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select> */}

        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className={FILTER_SELECT_CLASS}
        >
          {POSITIONS.map((pos) => (
            <option key={pos.value} value={pos.value}>
              {pos.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : players.length === 0 ? (
        <EmptyState
          message="No hay jugadores registrados."
          icon={<Users size={48} />}
          action={
            canAdd ? (
              <Button
                variant="primary"
                onClick={() => setCreateOpen(true)}
                className="min-h-11"
              >
                Agregar jugador
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} role={role} />
          ))}
        </div>
      )}

      <PlayerFormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        player={null}
      />
    </div>
  );
}
