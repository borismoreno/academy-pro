import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Users } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/hooks/useTeams";
import { useAuthStore } from "@/store/auth.store";
import TeamCard from "./components/TeamCard";
import TeamFormSheet from "./components/TeamFormSheet";

export default function TeamsPage() {
  const { teams, isLoading } = useTeams();
  const role = useAuthStore((state) => state.role);
  const isDirector = role === "academy_director";

  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL param so sheet opens immediately on mount when ?action=create
  const [createOpen, setCreateOpen] = useState(
    () => searchParams.get("action") === "create",
  );

  // Clean up the URL param — setSearchParams is not React setState, safe in effects
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Equipos"
        action={
          isDirector ? (
            <Button
              variant="primary"
              onClick={() => setCreateOpen(true)}
              className="min-h-11"
            >
              Crear equipo
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          message="No hay equipos registrados aún."
          icon={<Users size={48} />}
          action={
            isDirector ? (
              <Button
                variant="primary"
                onClick={() => setCreateOpen(true)}
                className="min-h-11"
              >
                Crear equipo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} role={role} />
          ))}
        </div>
      )}

      <TeamFormSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        team={null}
      />
    </div>
  );
}
