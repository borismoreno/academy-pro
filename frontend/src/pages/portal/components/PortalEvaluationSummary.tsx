import { Lock, TrendingUp, TrendingDown } from "lucide-react";
import type { EvaluationProgress } from "@/services/portal.service";
import type { EvaluationScoreItem } from "@/services/players.service";

interface PortalEvaluationSummaryProps {
  progress: EvaluationProgress | undefined;
  isLoading: boolean;
  isForbidden?: boolean;
  onClick?: () => void;
}

function SkeletonCard() {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-5 space-y-4">
        <div className="h-2.5 w-32 bg-surface-highest rounded" />
        <div className="h-12 w-16 bg-surface-highest rounded" />
        <div className="h-4 w-28 bg-surface-highest rounded" />
        <div className="h-2.5 w-36 bg-surface-highest rounded" />
        <div className="h-2.5 w-36 bg-surface-highest rounded" />
      </div>
    </div>
  );
}

function UpgradePromptCard() {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      {/* Top glow */}
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5 flex flex-col items-center gap-3 text-center">
        <Lock size={32} className="text-on-surface-variant" />

        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
          Evaluaciones
        </p>

        <p className="font-display text-[1.75rem] font-semibold text-on-surface">
          Disponible en Plan Pro
        </p>

        <p className="font-body text-sm text-on-surface-variant">
          Las evaluaciones detalladas de tu hijo están disponibles en el plan
          Pro. Habla con el director de la academia para actualizarlo.
        </p>
      </div>
    </div>
  );
}

function averageScore(scores: EvaluationScoreItem[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
}

function assessment(avg: number): { text: string; color: string } {
  if (avg >= 8)
    return { text: "¡Rendimiento sobresaliente!", color: "text-primary" };
  if (avg >= 6) return { text: "Buen rendimiento", color: "text-secondary" };
  return { text: "Necesita atención", color: "text-error-container" };
}

export default function PortalEvaluationSummary({
  progress,
  isLoading,
  isForbidden = false,
  onClick,
}: PortalEvaluationSummaryProps) {
  if (isLoading) return <SkeletonCard />;

  if (isForbidden) return <UpgradePromptCard />;

  const hasEvaluations = progress && progress.evaluations.length > 0;
  const latest = hasEvaluations
    ? [...progress.evaluations].sort(
        (a, b) =>
          new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime(),
      )[0]
    : null;
  // const latest = hasEvaluations ? progress.evaluations[0] : null;
  const avg = latest ? averageScore(latest.scores) : 0;
  const topMetric = latest
    ? [...latest.scores].sort((a, b) => b.score - a.score)[0]
    : null;
  const weakMetric = latest
    ? [...latest.scores].sort((a, b) => a.score - b.score)[0]
    : null;

  return (
    <div
      onClick={hasEvaluations ? onClick : undefined}
      className={`bg-surface-high rounded-3xl overflow-hidden transition-colors ${
        hasEvaluations ? "cursor-pointer hover:bg-surface-highest" : ""
      }`}
    >
      {/* Top glow */}
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5 flex flex-col gap-3">
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
          Última evaluación
        </p>

        {!hasEvaluations ? (
          <p className="font-body text-sm text-on-surface-variant">
            Sin evaluaciones aún
          </p>
        ) : (
          <>
            {/* Average score */}
            <p className="font-display text-5xl font-bold leading-none text-primary">
              {avg.toFixed(1)}
            </p>

            {/* Score bar */}
            <div className="w-full h-1.5 bg-surface-highest rounded-full">
              <div
                className="h-full bg-linear-to-r from-primary to-secondary rounded-full"
                style={{ width: `${(avg / 10) * 100}%` }}
              />
            </div>
            <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant text-right -mt-1">
              / 10
            </p>

            {/* Date */}
            <p className="font-body text-sm text-on-surface-variant">
              {new Date(latest!.evaluatedAt).toLocaleDateString("es-EC", {
                timeZone: "UTC",
              })}
            </p>

            {/* Metric badges */}
            {(topMetric || weakMetric) && (
              <div className="flex flex-col gap-2">
                {/* Best area badge */}
                {topMetric && (
                  <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-xl px-3 py-2">
                    <TrendingUp size={14} className="text-primary shrink-0" />
                    <div>
                      <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                        Mejor área
                      </p>
                      <p className="font-body text-[0.875rem] font-medium text-primary">
                        {topMetric.metricName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Weak area badge — only show if different from top */}
                {weakMetric && weakMetric.metricId !== topMetric?.metricId && (
                  <div className="flex items-center gap-2 bg-error-container/20 border border-error-container/30 rounded-xl px-3 py-2">
                    <TrendingDown
                      size={14}
                      className="text-error-container shrink-0"
                    />
                    <div>
                      <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                        A mejorar
                      </p>
                      <p className="font-body text-[0.875rem] font-medium text-error-container">
                        {weakMetric.metricName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Assessment */}
            <p
              className={[
                "font-body text-[0.6875rem] uppercase tracking-[0.05em]",
                assessment(avg).color,
              ].join(" ")}
            >
              {assessment(avg).text}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
