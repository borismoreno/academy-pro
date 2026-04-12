import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { useTeamDetail } from "@/hooks/useTeamDetail";
import { useAuthStore } from "@/store/auth.store";
import { fetchPlayers } from "@/services/dashboard.service";
import TeamFormSheet from "./components/TeamFormSheet";
import TeamCoachesList from "./components/TeamCoachesList";
import TeamSchedulesList from "./components/TeamSchedulesList";

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
      <div className="p-5 lg:p-6">{children}</div>
    </div>
  );
}

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const isDirector = role === "academy_director";

  const { team, isLoading, isError } = useTeamDetail(id ?? "");
  const [editOpen, setEditOpen] = useState(false);

  const { data: allPlayers = [] } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers,
    enabled: !!team,
  });

  const teamPlayers = allPlayers.filter((p) => p.teamId === id && p.isActive);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !team) {
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="tertiary"
          onClick={() => navigate("/teams")}
          className="self-start gap-1.5 min-h-11 -ml-2"
        >
          <ChevronLeft size={16} />
          Equipos
        </Button>
        <EmptyState message="Equipo no encontrado." />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Back button */}
        <Button
          variant="tertiary"
          onClick={() => navigate("/teams")}
          className="self-start gap-1.5 min-h-11 -ml-2"
        >
          <ChevronLeft size={16} />
          Equipos
        </Button>

        {/* Team header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-[2.5rem] lg:text-[3.5rem] font-bold text-on-surface leading-tight">
              {team.name}
            </h1>
            {isDirector && (
              <Button
                variant="secondary"
                onClick={() => setEditOpen(true)}
                className="shrink-0 min-h-11"
              >
                Editar equipo
              </Button>
            )}
          </div>
          {team.category && (
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-primary rounded-full px-3 py-1 self-start">
              {team.category}
            </span>
          )}
        </div>

        {/* Coaches + Schedules — 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard>
            <TeamCoachesList
              coaches={team.coaches}
              teamId={team.id}
              role={role}
            />
          </SectionCard>
          <SectionCard>
            <TeamSchedulesList
              schedules={team.schedules}
              teamId={team.id}
              role={role}
            />
          </SectionCard>
        </div>

        {/* Players — full width */}
        <SectionCard>
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-[1.125rem] font-semibold text-on-surface">
              Jugadores
            </h3>

            {teamPlayers.length === 0 ? (
              <EmptyState message="No hay jugadores en este equipo." />
            ) : (
              <div className="flex flex-col gap-1">
                {teamPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => navigate(`/players/${player.id}`)}
                    className="flex items-center gap-3 min-h-11 px-3 rounded-xl hover:bg-surface-highest transition-colors text-left -mx-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[0.875rem] text-on-surface truncate">
                        {player.fullName}
                      </p>
                    </div>
                    {player.position && (
                      <span className="shrink-0 font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-on-surface-variant rounded-full px-2.5 py-0.5">
                        {player.position}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <TeamFormSheet open={editOpen} onOpenChange={setEditOpen} team={team} />
    </>
  );
}
