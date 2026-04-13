import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import AddCoachSheet from "./AddCoachSheet";
import { useTeamDetail } from "@/hooks/useTeamDetail";
import type { TeamCoach } from "@/services/dashboard.service";
import type { UserRole } from "@/types";

interface TeamCoachesListProps {
  coaches: TeamCoach[];
  teamId: string;
  role: UserRole | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function TeamCoachesList({
  coaches,
  teamId,
  role,
}: TeamCoachesListProps) {
  const { removeCoachMutation } = useTeamDetail(teamId);
  const isDirector = role === "academy_director";

  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamCoach | null>(null);

  function handleRemoveConfirm() {
    if (!removeTarget) return;
    removeCoachMutation.mutate(removeTarget.userId, {
      onSuccess: () => setRemoveTarget(null),
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[1.125rem] font-semibold text-on-surface">
            Entrenadores
          </h3>
          {isDirector && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setAddOpen(true)}
              className="gap-1.5 min-h-11"
            >
              <Plus size={14} />
              Agregar entrenador
            </Button>
          )}
        </div>

        {/* List */}
        {coaches.length === 0 ? (
          <EmptyState message="No hay entrenadores asignados." />
        ) : (
          <div className="flex flex-col gap-3">
            {coaches.map((coach) => (
              <div key={coach.id} className="flex items-center gap-3">
                {/* Avatar */}
                <div className="shrink-0 w-9 h-9 rounded-full bg-surface-highest flex items-center justify-center">
                  <span className="font-body text-[0.6875rem] font-semibold text-primary">
                    {getInitials(coach.user.fullName)}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[0.875rem] text-on-surface truncate">
                    {coach.user.fullName}
                  </p>
                </div>

                {/* Role chip */}
                <span
                  className={`shrink-0 font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-2.5 py-0.5 ${
                    coach.isPrimary
                      ? "bg-primary-container text-on-primary"
                      : "bg-surface-highest text-on-surface-variant"
                  }`}
                >
                  {coach.isPrimary ? "Principal" : "Asistente"}
                </span>

                {/* Remove button */}
                {isDirector && (
                  <button
                    onClick={() => setRemoveTarget(coach)}
                    className="shrink-0 min-h-11 min-w-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-error-container transition-colors"
                    aria-label="Quitar entrenador"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddCoachSheet open={addOpen} onOpenChange={setAddOpen} teamId={teamId} />

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="¿Quitar entrenador?"
        description={`¿Deseas quitar a ${removeTarget?.user.fullName ?? ""} del equipo?`}
        confirmLabel="Quitar"
        variant="destructive"
        onConfirm={handleRemoveConfirm}
        isLoading={removeCoachMutation.isPending}
      />
    </>
  );
}
