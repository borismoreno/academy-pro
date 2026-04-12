import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/shared/EmptyState";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import AddScheduleSheet from "./AddScheduleSheet";
import { useTeamDetail } from "@/hooks/useTeamDetail";
import type { TeamSchedule } from "@/services/dashboard.service";
import type { UserRole } from "@/types";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

interface TeamSchedulesListProps {
  schedules: TeamSchedule[];
  teamId: string;
  role: UserRole | null;
}

export default function TeamSchedulesList({
  schedules,
  teamId,
  role,
}: TeamSchedulesListProps) {
  const { removeScheduleMutation } = useTeamDetail(teamId);
  const isDirector = role === "academy_director";

  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamSchedule | null>(null);

  function handleRemoveConfirm() {
    if (!removeTarget) return;
    removeScheduleMutation.mutate(removeTarget.id, {
      onSuccess: () => setRemoveTarget(null),
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[1.125rem] font-semibold text-on-surface">
            Horarios
          </h3>
          {isDirector && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setAddOpen(true)}
              className="gap-1.5 min-h-11"
            >
              <Plus size={14} />
              Agregar horario
            </Button>
          )}
        </div>

        {/* List */}
        {schedules.length === 0 ? (
          <EmptyState message="No hay horarios configurados." />
        ) : (
          <div className="flex flex-col gap-3">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                {/* Day chip */}
                <span className="shrink-0 font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-primary rounded-full px-3 py-1">
                  {DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek}
                </span>

                {/* Time */}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[0.875rem] text-on-surface">
                    {s.startTime} – {s.endTime}
                  </p>
                  {s.field?.name && (
                    <p className="font-body text-[0.75rem] text-on-surface-variant truncate">
                      {s.field.name}
                    </p>
                  )}
                </div>

                {/* Remove */}
                {isDirector && (
                  <button
                    onClick={() => setRemoveTarget(s)}
                    className="shrink-0 min-h-11 min-w-[44px] flex items-center justify-center rounded-xl text-on-surface-variant hover:text-error-container transition-colors"
                    aria-label="Eliminar horario"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddScheduleSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        teamId={teamId}
      />

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="¿Eliminar horario?"
        description={`¿Deseas eliminar el horario del ${DAY_LABELS[removeTarget?.dayOfWeek ?? ""] ?? ""} de ${removeTarget?.startTime ?? ""} a ${removeTarget?.endTime ?? ""}?`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleRemoveConfirm}
        isLoading={removeScheduleMutation.isPending}
      />
    </>
  );
}
