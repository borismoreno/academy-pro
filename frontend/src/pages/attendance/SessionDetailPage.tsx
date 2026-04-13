import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, User, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useAuthStore } from "@/store/auth.store";
import { useSessionDetail } from "@/hooks/useSessionDetail";
import { updateSession } from "@/services/attendance.service";
import type { UpdateSessionData } from "@/services/attendance.service";
import AttendanceList from "./components/AttendanceList";

const TEXTAREA_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary resize-none placeholder:text-on-surface-variant/50 disabled:opacity-50 disabled:cursor-not-allowed";

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message)
      return axiosError.response.data.message;
  }
  return "Ha ocurrido un error inesperado";
}

function formatFullDate(dateStr: string): string {
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

export default function SessionDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { session, records, isLoading, bulkUpdateMutation } =
    useSessionDetail(id);

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  const updateNotesMutation = useMutation({
    mutationFn: (data: UpdateSessionData) => updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setEditingNotes(false);
      toast({ description: "Notas actualizadas correctamente" });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  function startEditingNotes() {
    setNotesValue(session?.notes ?? "");
    setEditingNotes(true);
  }

  function cancelEditingNotes() {
    setEditingNotes(false);
  }

  function saveNotes() {
    updateNotesMutation.mutate({ notes: notesValue.trim() || undefined });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center py-16">
        <p className="font-body text-sm text-on-surface-variant">
          Sesión no encontrada.
        </p>
      </div>
    );
  }

  const total = session.totalPresent + session.totalAbsent;
  const presentPct =
    total > 0 ? Math.round((session.totalPresent / total) * 100) : 0;
  const coachName = user && session.coachId === user.id ? user.fullName : null;
  const canEditNotes = role === "academy_director" || role === "coach";

  return (
    <div className="flex flex-col gap-6">
      {/* Hero card */}
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />

        <div className="p-6 flex flex-col gap-4">
          {/* Back button */}
          <button
            onClick={() => navigate("/attendance")}
            className="self-start flex items-center gap-1.5 font-body text-sm text-on-surface-variant hover:text-primary transition-colors -ml-1"
          >
            <ArrowLeft size={16} />
            Asistencia
          </button>

          {/* Date */}
          <h1 className="font-display text-[2rem] lg:text-[3.5rem] font-bold text-on-surface leading-tight">
            {formatFullDate(session.sessionDate)}
          </h1>

          {/* Team */}
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-on-surface-variant shrink-0" />
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              {session.team.name}
            </span>
          </div>

          {/* Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-primary-container text-on-primary rounded-full px-3 py-1">
              {session.totalPresent} presentes
            </span>
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-error-container text-on-surface rounded-full px-3 py-1">
              {session.totalAbsent} ausentes
            </span>
          </div>

          {/* Percentage */}
          <p className="font-display text-[3.5rem] font-bold text-primary leading-none">
            {presentPct}%
          </p>

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
              <span className="font-body text-sm text-on-surface-variant">
                Registrado por {coachName}
              </span>
            </div>
          )}

          {/* Notes */}
          {editingNotes ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={3}
                placeholder="Observaciones de la sesión..."
                className={TEXTAREA_CLASS}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={saveNotes}
                  disabled={updateNotesMutation.isPending}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl font-body text-sm font-semibold bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {updateNotesMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : null}
                  Guardar
                </button>
                <button
                  onClick={cancelEditingNotes}
                  disabled={updateNotesMutation.isPending}
                  className="h-9 px-4 rounded-xl font-body text-sm text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {session.notes && (
                <div className="flex items-start gap-1.5">
                  <FileText
                    size={14}
                    className="text-on-surface-variant shrink-0 mt-0.5"
                  />
                  <p className="font-body text-sm text-on-surface-variant italic">
                    {session.notes}
                  </p>
                </div>
              )}
              {canEditNotes && (
                <button
                  onClick={startEditingNotes}
                  className="self-start font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  {session.notes ? "Editar notas" : "+ Agregar notas"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attendance list */}
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
        <div className="p-5 lg:p-6">
          <h2 className="font-display text-lg font-semibold text-on-surface mb-4">
            Registro de asistencia
          </h2>
          <AttendanceList
            sessionId={session.id}
            records={records}
            onBulkUpdate={async (data) => {
              await bulkUpdateMutation.mutateAsync(data);
            }}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
