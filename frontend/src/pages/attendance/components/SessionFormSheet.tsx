import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { DateSelector } from "@/components/shared/DateSelector";
import { toast } from "@/hooks/use-toast";
import { useTeams } from "@/hooks/useTeams";
import {
  createSession,
  bulkUpdateRecords,
} from "@/services/attendance.service";
import type {
  CreateSessionData,
  BulkUpdateData,
} from "@/services/attendance.service";
import type { Session } from "@/types";
import AttendanceList from "./AttendanceList";

const SELECT_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary min-h-11 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

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

function todayAsISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isDesktop;
}

// ── Step 1: Session form ───────────────────────────────────────────────────────

interface SessionFormProps {
  onCreated: (session: Session) => void;
}

function SessionForm({ onCreated }: SessionFormProps) {
  const queryClient = useQueryClient();
  const { teams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  const [teamId, setTeamId] = useState("");
  const [sessionDate, setSessionDate] = useState(todayAsISO());
  const [notes, setNotes] = useState("");
  const [teamIdError, setTeamIdError] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: CreateSessionData) => createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) {
      setTeamIdError("Selecciona un equipo");
      return;
    }
    setTeamIdError("");

    const payload: CreateSessionData = {
      teamId,
      sessionDate,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    createMutation.mutate(payload, {
      onSuccess: (session) => {
        toast({ description: "Sesión registrada correctamente" });
        onCreated(session);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Team */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Equipo
        </label>
        <select
          value={teamId}
          onChange={(e) => {
            setTeamId(e.target.value);
            if (teamIdError) setTeamIdError("");
          }}
          disabled={createMutation.isPending}
          className={SELECT_CLASS}
        >
          <option value="">Seleccionar equipo</option>
          {activeTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        {teamIdError && (
          <p className="font-body text-xs text-error-container">
            {teamIdError}
          </p>
        )}
      </div>

      {/* Session date */}
      <DateSelector
        label="Fecha de la sesión"
        value={sessionDate}
        onChange={(val) => setSessionDate(val)}
      />

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones de la sesión..."
          rows={3}
          disabled={createMutation.isPending}
          className={TEXTAREA_CLASS}
        />
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {createMutation.isPending ? <LoadingSpinner size="sm" /> : null}
        Registrar sesión
      </button>
    </form>
  );
}

// ── Step 2: Attendance marking ─────────────────────────────────────────────────

interface AttendanceStepProps {
  session: Session;
  onFinish: () => void;
}

function AttendanceStep({ session, onFinish }: AttendanceStepProps) {
  const queryClient = useQueryClient();

  const bulkMutation = useMutation({
    mutationFn: (data: BulkUpdateData) => bulkUpdateRecords(session.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", session.id] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  return (
    <div className="px-6 pb-4 flex flex-col gap-4">
      <AttendanceList
        sessionId={session.id}
        records={session.records}
        onBulkUpdate={async (data) => {
          await bulkMutation.mutateAsync(data);
        }}
        isLoading={false}
      />
      <button
        type="button"
        onClick={onFinish}
        className="w-full h-12 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer"
      >
        Finalizar
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface SessionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SessionFormSheet({
  open,
  onOpenChange,
}: SessionFormSheetProps) {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const [step, setStep] = useState<"form" | "attendance">("form");
  const [createdSession, setCreatedSession] = useState<Session | null>(null);

  function handleCreated(session: Session) {
    setCreatedSession(session);
    setStep("attendance");
  }

  function handleFinish() {
    const id = createdSession?.id;
    setStep("form");
    setCreatedSession(null);
    onOpenChange(false);
    if (id) navigate(`/attendance/${id}`);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setStep("form");
      setCreatedSession(null);
    }
    onOpenChange(open);
  }

  const title = step === "form" ? "Registrar sesión" : "Marcar asistencia";
  const contentKey = `${open}-${step}`;

  const content =
    step === "form" ? (
      <SessionForm key={contentKey} onCreated={handleCreated} />
    ) : (
      <AttendanceStep
        key={contentKey}
        session={createdSession!}
        onFinish={handleFinish}
      />
    );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl min-w-120 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5 max-h-[80vh] overflow-y-auto">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="bg-surface-high border-0 rounded-t-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="font-display text-xl font-semibold text-on-surface">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-5">{content}</div>
      </SheetContent>
    </Sheet>
  );
}
