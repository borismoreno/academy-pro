import type { EvaluationProgress } from '@/services/portal.service';
import type { EvaluationScoreItem } from '@/services/players.service';

interface PortalEvaluationSummaryProps {
  progress: EvaluationProgress | undefined;
  isLoading: boolean;
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

function averageScore(scores: EvaluationScoreItem[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
}

function assessment(avg: number): { text: string; color: string } {
  if (avg >= 8) return { text: '¡Rendimiento sobresaliente!', color: 'text-primary' };
  if (avg >= 6) return { text: 'Buen rendimiento', color: 'text-secondary' };
  return { text: 'Necesita atención', color: 'text-error-container' };
}

export default function PortalEvaluationSummary({
  progress,
  isLoading,
}: PortalEvaluationSummaryProps) {
  if (isLoading) return <SkeletonCard />;

  const hasEvaluations = progress && progress.evaluations.length > 0;
  const latest = hasEvaluations ? progress.evaluations[0] : null;
  const avg = latest ? averageScore(latest.scores) : 0;
  const topMetric = latest
    ? [...latest.scores].sort((a, b) => b.score - a.score)[0]
    : null;
  const weakMetric = latest
    ? [...latest.scores].sort((a, b) => a.score - b.score)[0]
    : null;

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      {/* Top glow */}
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5 flex flex-col gap-3">
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
          Última evaluación
        </p>

        {!hasEvaluations ? (
          <p className="font-body text-[0.875rem] text-on-surface-variant">
            Sin evaluaciones aún
          </p>
        ) : (
          <>
            {/* Average score */}
            <p className="font-display text-[3rem] font-bold leading-none text-primary">
              {avg.toFixed(1)}
            </p>

            {/* Date */}
            <p className="font-body text-[0.875rem] text-on-surface-variant">
              {new Date(latest!.evaluatedAt).toLocaleDateString('es-EC')}
            </p>

            {/* Top metric */}
            {topMetric && (
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Mejor área:{' '}
                <span className="text-primary font-medium normal-case tracking-normal">
                  {topMetric.metricName}
                </span>
              </p>
            )}

            {/* Weak metric — only show if different from top */}
            {weakMetric && weakMetric.metricId !== topMetric?.metricId && (
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                A mejorar:{' '}
                <span className="text-error-container font-medium normal-case tracking-normal">
                  {weakMetric.metricName}
                </span>
              </p>
            )}

            {/* Assessment */}
            <p
              className={[
                'font-body text-[0.6875rem] uppercase tracking-[0.05em]',
                assessment(avg).color,
              ].join(' ')}
            >
              {assessment(avg).text}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
