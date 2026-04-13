import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Users, User, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import type { SessionListItem, UserRole } from "@/types";

interface SessionCardProps {
  session: SessionListItem;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  role: UserRole | null;
  currentUserId: string | null;
  currentUserName: string | null;
}

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr);
  const formatted = date.toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Bogota",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function SessionCard({
  session,
  onDelete,
  isDeleting,
  role,
  currentUserId,
  currentUserName,
}: SessionCardProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const total = session.totalPresent + session.totalAbsent;
  const presentPct = total > 0 ? (session.totalPresent / total) * 100 : 0;

  const coachName =
    currentUserId && session.coachId === currentUserId ? currentUserName : null;

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("[data-dropdown]")) return;
    navigate(`/attendance/${session.id}`);
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-surface-high rounded-3xl overflow-hidden hover:bg-surface-highest transition-colors cursor-pointer"
      >
        {/* Top glow */}
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />

        <div className="p-5 flex flex-col gap-3">
          {/* Top row: date + dropdown */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[1.125rem] font-semibold text-on-surface leading-tight">
              {formatSessionDate(session.sessionDate)}
            </h3>

            {role === "academy_director" && (
              <div data-dropdown onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="min-h-11 min-w-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface transition-colors -mr-2 -mt-1">
                      <MoreVertical size={18} />
                      <span className="sr-only">Opciones</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setConfirmOpen(true)}
                      className="text-error-container hover:text-error-container"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Team name */}
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-on-surface-variant shrink-0" />
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              {session.team.name}
            </span>
          </div>

          {/* Attendance chips */}
          <div className="flex items-center gap-2">
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-primary-container text-on-primary rounded-full px-3 py-1">
              {session.totalPresent} presentes
            </span>
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-error-container text-on-surface rounded-full px-3 py-1">
              {session.totalAbsent} ausentes
            </span>
          </div>

          {/* Attendance bar */}
          <div className="w-full h-1.5 bg-surface-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all"
              style={{ width: `${presentPct}%` }}
            />
          </div>

          {/* Recorded by */}
          {coachName && (
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-on-surface-variant shrink-0" />
              <span className="font-body text-[0.875rem] text-on-surface-variant">
                Registrado por {coachName}
              </span>
            </div>
          )}

          {/* Notes preview */}
          {session.notes && (
            <div className="flex items-center gap-1.5">
              <FileText
                size={14}
                className="text-on-surface-variant shrink-0"
              />
              <span className="font-body text-[0.875rem] text-on-surface-variant italic truncate">
                {session.notes}
              </span>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Eliminar sesión?"
        description="¿Estás seguro? Se eliminarán todos los registros de asistencia de esta sesión."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => {
          onDelete(session.id);
          setConfirmOpen(false);
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
