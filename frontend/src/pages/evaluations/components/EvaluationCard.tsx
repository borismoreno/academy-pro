import { useNavigate } from "react-router-dom";
import { Users, User, FileText } from "lucide-react";
import type { Evaluation } from "@/types";

interface EvaluationCardProps {
  evaluation: Evaluation;
  role: string | null;
}

function getAverageColor(avg: number): string {
  if (avg >= 7) return "text-primary";
  if (avg >= 5) return "text-secondary";
  return "text-error-container";
}

export default function EvaluationCard({ evaluation }: EvaluationCardProps) {
  const navigate = useNavigate();

  const avg =
    evaluation.scores.length > 0
      ? Math.round(
          (evaluation.scores.reduce((sum, s) => sum + s.score, 0) /
            evaluation.scores.length) *
            10,
        ) / 10
      : 0;

  const previewScores = evaluation.scores.slice(0, 3);
  const extraCount = evaluation.scores.length - 3;

  const formattedDate = new Date(evaluation.evaluatedAt).toLocaleDateString(
    "es-EC",
  );

  return (
    <div
      onClick={() => navigate(`/evaluations/${evaluation.id}`)}
      className="bg-surface-high rounded-3xl overflow-hidden hover:bg-surface-highest transition-colors cursor-pointer"
    >
      {/* Top glow */}
      <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />

      <div className="p-5 flex flex-col gap-3">
        {/* Top row: player name + date */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-on-surface leading-tight flex-1 min-w-0">
            {evaluation.player.fullName}
          </h3>
          <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant shrink-0">
            {formattedDate}
          </span>
        </div>

        {/* Team + position */}
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-on-surface-variant shrink-0" />
          <span className="font-body text-sm text-on-surface-variant truncate">
            {evaluation.player.position ?? "Sin posición"}
          </span>
        </div>

        {/* Coach */}
        <div className="flex items-center gap-1.5">
          <User size={14} className="text-on-surface-variant shrink-0" />
          <span className="font-body text-sm text-on-surface-variant truncate">
            Evaluado por {evaluation.coach.fullName}
          </span>
        </div>

        {/* Average + score chips row */}
        <div className="flex items-center justify-between gap-3">
          {/* Score chips */}
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {previewScores.map((s) => (
              <span
                key={s.id}
                className="bg-surface-highest rounded-full px-3 py-1 flex items-center gap-1.5"
              >
                <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                  {s.metricName}
                </span>
                <span className="font-body text-[0.6875rem] text-primary font-bold">
                  {s.score}
                </span>
              </span>
            ))}
            {extraCount > 0 && (
              <span className="bg-surface-highest rounded-full px-3 py-1 font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                +{extraCount} más
              </span>
            )}
          </div>

          {/* Average score */}
          <span
            className={`font-display text-[2rem] font-bold leading-none shrink-0 ${getAverageColor(avg)}`}
          >
            {avg.toFixed(1)}
          </span>
        </div>

        {/* Notes preview */}
        {evaluation.coachNotes && (
          <div className="flex items-start gap-1.5">
            <FileText
              size={14}
              className="text-on-surface-variant shrink-0 mt-0.5"
            />
            <p className="font-body text-sm text-on-surface-variant italic truncate">
              {evaluation.coachNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
