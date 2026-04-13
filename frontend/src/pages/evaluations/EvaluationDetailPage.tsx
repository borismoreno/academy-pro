import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, User, FileText } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useEvaluationDetail } from "@/hooks/useEvaluationDetail";
import { useTeams } from "@/hooks/useTeams";
import EvaluationProgressChart from "./components/EvaluationProgressChart";

function getAverageColor(avg: number): string {
  if (avg >= 7) return "text-primary";
  if (avg >= 5) return "text-secondary";
  return "text-error-container";
}

function formatEvaluationDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d
    .toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Bogota",
    })
    .toUpperCase();
}

export default function EvaluationDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { evaluation, isLoading } = useEvaluationDetail(id);
  const { teams } = useTeams();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex justify-center py-16">
        <p className="font-body text-sm text-on-surface-variant">
          Evaluación no encontrada.
        </p>
      </div>
    );
  }

  const teamName = teams.find((t) => t.id === evaluation.player.teamId)?.name;

  const avg =
    evaluation.scores.length > 0
      ? Math.round(
          (evaluation.scores.reduce((sum, s) => sum + s.score, 0) /
            evaluation.scores.length) *
            10,
        ) / 10
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Hero card ── */}
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />

        <div className="p-6 flex flex-col gap-4">
          {/* Back */}
          <button
            onClick={() => navigate("/evaluations")}
            className="self-start flex items-center gap-1.5 font-body text-sm text-on-surface-variant hover:text-primary transition-colors -ml-1"
          >
            <ArrowLeft size={16} />
            Evaluaciones
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex flex-col gap-3 flex-1">
              {/* Player name */}
              <h1 className="font-display text-[2.5rem] lg:text-[3.5rem] font-bold text-on-surface leading-tight">
                {evaluation.player.fullName}
              </h1>

              {/* Position + team chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {evaluation.player.position && (
                  <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-secondary-container text-on-surface rounded-full px-3 py-1">
                    {evaluation.player.position}
                  </span>
                )}
              </div>

              {/* Date label */}
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Evaluación del {formatEvaluationDate(evaluation.evaluatedAt)}
              </p>

              {/* Coach */}
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-on-surface-variant shrink-0" />
                <span className="font-body text-sm text-on-surface-variant">
                  Por {evaluation.coach.fullName}
                </span>
              </div>

              {/* Team */}
              {teamName && (
                <div className="flex items-center gap-1.5">
                  <Users
                    size={14}
                    className="text-on-surface-variant shrink-0"
                  />
                  <span className="font-body text-sm text-on-surface-variant">
                    {teamName}
                  </span>
                </div>
              )}
            </div>

            {/* Average score */}
            <span
              className={`font-display text-[4rem] font-bold leading-none ${getAverageColor(avg)}`}
            >
              {avg.toFixed(1)}
            </span>
          </div>

          {/* Notes */}
          {evaluation.coachNotes && (
            <div className="bg-surface-highest rounded-xl p-4 flex items-start gap-2">
              <FileText
                size={14}
                className="text-on-surface-variant shrink-0 mt-0.5"
              />
              <p className="font-body text-sm text-on-surface-variant italic">
                {evaluation.coachNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Scores section ── */}
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
        <div className="p-5 lg:p-6 flex flex-col gap-6">
          <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
            Calificaciones
          </h2>

          <div className="flex flex-col gap-6">
            {evaluation.scores.map((score) => (
              <div key={score.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-on-surface flex-1">
                    {score.metricName}
                  </span>
                  <span className="font-display text-[1.75rem] font-bold text-primary leading-none w-12 text-right">
                    {score.score}
                  </span>
                </div>
                <div className="w-full h-1 bg-surface-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all"
                    style={{ width: `${score.score * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Progress chart ── */}
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
        <div className="p-5 lg:p-6 flex flex-col gap-5">
          <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
            Progreso del jugador
          </h2>
          <EvaluationProgressChart playerId={evaluation.playerId} />
        </div>
      </div>

      {/* ── View player profile ── */}
      <button
        onClick={() => navigate(`/players/${evaluation.playerId}`)}
        className="self-start flex items-center gap-2 h-11 px-5 rounded-xl font-body font-medium text-sm bg-surface-highest text-primary hover:opacity-80 transition-opacity cursor-pointer"
      >
        Ver perfil del jugador
      </button>
    </div>
  );
}
