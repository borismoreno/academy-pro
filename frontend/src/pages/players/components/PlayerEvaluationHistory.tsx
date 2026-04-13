import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import type { EvaluationProgress } from "@/services/players.service";

interface Props {
  progress: EvaluationProgress | undefined;
  isLoading: boolean;
  playerId: string;
}

export default function PlayerEvaluationHistory({
  progress,
  isLoading,
  playerId,
}: Props) {
  const navigate = useNavigate();

  const latestEvaluation = progress?.evaluations.length
    ? [...progress.evaluations].sort(
        (a, b) =>
          new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime(),
      )[0]
    : null;

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
      <div className="p-5 lg:p-6 flex flex-col gap-4">
        <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
          Evaluaciones
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : !latestEvaluation ? (
          <EmptyState message="Sin evaluaciones registradas." />
        ) : (
          <>
            <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              Última evaluación:{" "}
              {new Date(latestEvaluation.evaluatedAt).toLocaleDateString(
                "es-EC",
              )}
            </p>

            <div className="flex flex-col gap-4">
              {latestEvaluation.scores.map((score) => (
                <div key={score.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-on-surface-variant">
                      {score.metricName}
                    </span>
                    <span className="font-display text-[1.75rem] font-semibold text-primary leading-none">
                      {score.score}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-surface-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${score.score * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(`/evaluations?playerId=${playerId}`)}
              className="self-start font-body text-sm text-on-surface-variant hover:text-primary transition-colors min-h-11 flex items-center"
            >
              Ver historial completo →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
