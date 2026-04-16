import { useState, useEffect, useMemo } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { usePlayers } from "@/hooks/usePlayers";
import { useEvaluationMetrics } from "@/hooks/useEvaluationMetrics";
import { createEvaluation } from "@/services/evaluations.service";
import type { CreateEvaluationData } from "@/services/evaluations.service";
import MetricScoreInput from "./MetricScoreInput";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
// import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";

const TEXTAREA_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary resize-none placeholder:text-on-surface-variant/50 disabled:opacity-50 disabled:cursor-not-allowed";

function todayAsISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message)
      return axiosError.response.data.message;
  }
  return "Ha ocurrido un error inesperado";
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

// ── Form inner content ────────────────────────────────────────────────────────

interface FormContentProps {
  defaultPlayerId?: string;
  onSuccess: () => void;
}

function FormContent({ defaultPlayerId, onSuccess }: FormContentProps) {
  const queryClient = useQueryClient();
  const { players, isLoading: isLoadingPlayers } = usePlayers();
  const { metrics, isLoading: metricsLoading } = useEvaluationMetrics();

  const activePlayers = players.filter((p) => p.isActive);
  const activeMetrics = metrics
    .filter((m) => m.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const [playerId, setPlayerId] = useState(defaultPlayerId ?? "");
  const [evaluatedAt, setEvaluatedAt] = useState(todayAsISO());
  const [coachNotes, setCoachNotes] = useState("");
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [playerError, setPlayerError] = useState("");
  const [scoresError, setScoresError] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Reset scores when metrics load
  useEffect(() => {
    const initial: Record<string, number | null> = {};
    for (const m of activeMetrics) {
      initial[m.id] = scores[m.id] ?? null;
    }
    setScores(initial);
    // Only run when activeMetrics changes (by length/ids)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMetrics.length]);

  const average = useMemo(() => {
    const filled = activeMetrics
      .map((m) => scores[m.id])
      .filter((v): v is number => v !== null && v !== undefined);
    if (filled.length === 0) return null;
    return (
      Math.round((filled.reduce((a, b) => a + b, 0) / filled.length) * 10) / 10
    );
  }, [scores, activeMetrics]);

  function handleScoreChange(metricId: string, score: number) {
    setScores((prev) => ({ ...prev, [metricId]: score }));
    if (scoresError) setScoresError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!playerId) {
      setPlayerError("Selecciona un jugador");
      return;
    }
    setPlayerError("");

    if (activeMetrics.length === 0) {
      setScoresError(
        "No hay métricas configuradas para esta academia. Contacta al director.",
      );
      return;
    }

    const allFilled = activeMetrics.every(
      (m) => scores[m.id] !== null && scores[m.id] !== undefined,
    );
    if (!allFilled) {
      setScoresError("Califica todas las métricas");
      return;
    }
    setScoresError("");

    const payload: CreateEvaluationData = {
      playerId,
      evaluatedAt,
      scores: activeMetrics.map((m) => ({
        metricId: m.id,
        score: scores[m.id] as number,
      })),
      ...(coachNotes.trim() ? { coachNotes: coachNotes.trim() } : {}),
    };

    setIsPending(true);
    try {
      await createEvaluation(payload);
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["player", playerId] });
      toast({ description: "Evaluación guardada correctamente" });
      onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  }

  if (metricsLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (activeMetrics.length === 0) {
    return (
      <div className="px-6 pb-8 flex flex-col gap-4">
        <p className="font-body text-sm text-on-surface-variant text-center py-8">
          No hay métricas de evaluación configuradas para esta academia. El
          director debe configurarlas antes de crear evaluaciones.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* ── Basic info ── */}
      {/* Player */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Jugador
        </label>
        <SearchableSelect
          options={activePlayers.map((p) => ({
            value: p.id,
            label: p.fullName,
            subtitle: p.team?.name,
          }))}
          value={playerId}
          onValueChange={(val) => {
            setPlayerId(val);
            if (playerError) setPlayerError("");
          }}
          placeholder="Seleccionar jugador"
          searchPlaceholder="Buscar jugador..."
          isLoading={isLoadingPlayers}
          disabled={isPending}
        />
        {playerError && (
          <p className="font-body text-xs text-error-container">
            {playerError}
          </p>
        )}
      </div>

      {/* Date */}
      <DateSelector
        label="Fecha de evaluación"
        value={evaluatedAt}
        onChange={(val) => setEvaluatedAt(val)}
      />

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Notas del entrenador (opcional)
        </label>
        <textarea
          value={coachNotes}
          onChange={(e) => setCoachNotes(e.target.value)}
          placeholder="Observaciones generales del jugador..."
          rows={3}
          disabled={isPending}
          className={TEXTAREA_CLASS}
        />
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-surface-highest" />

      {/* ── Scores section ── */}
      <div className="flex flex-col gap-4">
        {/* Sticky average */}
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
            Calificaciones
          </h3>
          <div className="flex flex-col items-end">
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              Promedio
            </span>
            <span className="font-display text-[1.75rem] font-bold text-primary leading-none">
              {average !== null ? average.toFixed(1) : "—"}
            </span>
          </div>
        </div>

        {scoresError && (
          <p className="font-body text-xs text-error-container">
            {scoresError}
          </p>
        )}

        {activeMetrics.map((metric) => (
          <MetricScoreInput
            key={metric.id}
            metricName={metric.metricName}
            value={scores[metric.id] ?? null}
            onChange={(score) => handleScoreChange(metric.id, score)}
          />
        ))}
      </div>

      {/* ── CTA ── */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer sticky bottom-0"
      >
        {isPending ? <LoadingSpinner size="sm" /> : null}
        Guardar evaluación
      </button>
    </form>
  );
}

// ── Main sheet/dialog wrapper ─────────────────────────────────────────────────

interface EvaluationFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPlayerId?: string;
}

export default function EvaluationFormSheet({
  open,
  onOpenChange,
  defaultPlayerId,
}: EvaluationFormSheetProps) {
  const isDesktop = useIsDesktop();
  // const keyboardOffset = useKeyboardOffset(); // Just to trigger re-render on keyboard open/close for better sheet positioning

  function handleSuccess() {
    onOpenChange(false);
  }

  const title = "Nueva evaluación";

  const content = (
    <FormContent
      key={String(open)}
      defaultPlayerId={defaultPlayerId}
      onSuccess={handleSuccess}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-140 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5 max-h-[90vh] overflow-y-auto">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-high border-0 rounded-t-3xl max-h-[95vh] overflow-y-auto p-0">
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
