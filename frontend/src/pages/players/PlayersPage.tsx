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
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PlayersPage() {
  const role = useAuthStore((state) => state.role);
  const canAdd = role === "academy_director";

  const [teamFilter, setTeamFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filters = {
    ...(teamFilter ? { teamId: teamFilter } : {}),
    ...(positionFilter ? { position: positionFilter } : {}),
  };

  const { players, isLoading } = usePlayers(
    Object.keys(filters).length > 0 ? filters : undefined,
  );

  // Derive unique positions from ALL players (no filters applied)
  const { players: allPlayers } = usePlayers();
  const positionOptions = [
    { value: "", label: "Todas las posiciones" },
    ...Array.from(
      new Set(
        allPlayers.map((p) => p.position).filter((pos): pos is string => !!pos),
      ),
    )
      .sort()
      .map((pos) => ({ value: pos, label: pos })),
  ];
  const filteredPlayers = players.filter((p) =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
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
        <div className="w-full sm:w-56">
          <SearchableSelect
            options={positionOptions}
            value={positionFilter || ""}
            onValueChange={(val) => setPositionFilter(val)}
            placeholder="Todas las posiciones"
            searchPlaceholder="Buscar posición..."
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar jugador..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredPlayers.length === 0 ? (
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
          {filteredPlayers.map((player) => (
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
