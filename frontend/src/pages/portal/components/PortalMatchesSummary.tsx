import { Trophy, Lock } from "lucide-react";
import type { PortalMatchEntry } from "@/types/match.types";
import type { PlayerSeasonSummary } from "@/types/match.types";
import { formatStatValue } from "@/lib/utils";

interface PortalMatchesSummaryProps {
  matchHistory: PortalMatchEntry[] | undefined;
  seasonStats: PlayerSeasonSummary | undefined;
  isLoading: boolean;
  isForbidden?: boolean;
}

function UpgradePromptCard() {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-5 flex flex-col items-center gap-3 text-center">
        <Lock size={32} className="text-on-surface-variant" />
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
          Encuentros
        </p>
        <p className="font-display text-[1.75rem] font-semibold text-on-surface">
          Disponible en Plan Pro
        </p>
        <p className="font-body text-sm text-on-surface-variant">
          El historial de encuentros está disponible en planes Pro y Enterprise.
          Habla con el director de la academia para actualizarlo.
        </p>
        <a
          href="https://cancha360.com/#pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm font-medium text-primary hover:underline mt-1"
        >
          Ver planes
        </a>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-5 space-y-4">
        <div className="h-5 w-32 bg-surface-highest rounded" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-highest rounded-2xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface-highest rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatScore(
  local: number | null,
  visitor: number | null,
): string | null {
  if (local === null || visitor === null) return null;
  return `${local} — ${visitor}`;
}

export default function PortalMatchesSummary({
  matchHistory,
  seasonStats,
  isLoading,
  isForbidden = false,
}: PortalMatchesSummaryProps) {
  if (isForbidden) return <UpgradePromptCard />;
  if (isLoading) return <SkeletonCard />;

  const matches = matchHistory ?? [];
  const recent = matches.slice(0, 5);
  const hasSeasonData = seasonStats && seasonStats.matchesPlayed > 0;

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5 flex flex-col gap-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-primary" />
            <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
              Mis Encuentros
            </h3>
          </div>
          {hasSeasonData && (
            <p className="font-body text-sm text-on-surface-variant mt-1">
              {seasonStats.matchesPlayed} encuentro
              {seasonStats.matchesPlayed !== 1 ? "s" : ""} ·{" "}
              {seasonStats.minutesPlayed} min jugados
            </p>
          )}
        </div>

        {/* Season stat grid */}
        {hasSeasonData && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-highest rounded-2xl p-3 flex flex-col gap-1">
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Encuentros
              </p>
              <p className="font-display text-2xl font-bold text-primary leading-none">
                {seasonStats.matchesPlayed}
              </p>
            </div>
            <div className="bg-surface-highest rounded-2xl p-3 flex flex-col gap-1">
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Minutos
              </p>
              <p className="font-display text-2xl font-bold text-secondary leading-none">
                {seasonStats.minutesPlayed}
              </p>
            </div>
            {seasonStats.statsByStat.map((stat) => (
              <div
                key={stat.metricId}
                className="bg-surface-highest rounded-2xl p-3 flex flex-col gap-1"
              >
                <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                  {stat.metricName}
                </p>
                <p className="font-display text-2xl font-bold text-on-surface leading-none">
                  {formatStatValue(stat.total, null, stat.statType, stat.unitLabel)}
                </p>
                <p className="font-body text-[0.6875rem] text-on-surface-variant">
                  Prom:{" "}
                  {formatStatValue(
                    stat.average,
                    null,
                    stat.statType,
                    stat.unitLabel,
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Match list */}
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <Trophy size={36} className="text-on-surface-variant" />
            <p className="font-body text-sm text-on-surface-variant">
              Sin encuentros registrados
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              Encuentros recientes
            </p>

            {recent.map((match) => {
              const title =
                match.matchType === "team_vs"
                  ? `${match.team.name} vs ${match.opponent ?? "?"}`
                  : `${match.team.name} — Encuentro individual`;
              const score =
                match.matchType === "team_vs"
                  ? formatScore(match.scoreLocal, match.scoreVisitor)
                  : null;
              const role = match.lineupEntry.isStarter ? "Titular" : "Suplente";
              const minutes =
                match.lineupEntry.minutesPlayed !== null
                  ? `${match.lineupEntry.minutesPlayed} min`
                  : null;

              return (
                <div
                  key={match.id}
                  className="bg-surface-highest rounded-2xl p-4 flex flex-col gap-2"
                >
                  {/* Title + score */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-body text-sm font-medium text-on-surface leading-tight">
                      {title}
                    </p>
                    {score && (
                      <span className="shrink-0 font-display font-semibold text-sm text-primary">
                        {score}
                      </span>
                    )}
                  </div>

                  {/* Date + location */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-body text-[0.75rem] text-on-surface-variant">
                      {new Date(match.matchDate).toLocaleDateString("es-EC", {
                        timeZone: "UTC",
                      })}
                    </p>
                    {match.location && (
                      <>
                        <span className="text-on-surface-variant text-[0.75rem]">·</span>
                        <p className="font-body text-[0.75rem] text-on-surface-variant">
                          {match.location}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Participation */}
                  <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                    {[role, minutes].filter(Boolean).join(" · ")}
                  </p>

                  {/* Stat chips */}
                  {match.playerStats.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {match.playerStats.map((stat, i) => (
                        <span
                          key={i}
                          className="font-body text-[0.6875rem] bg-secondary-container text-secondary rounded-full px-2.5 py-0.5"
                        >
                          {stat.metricName}:{" "}
                          {formatStatValue(
                            stat.value,
                            stat.boolValue,
                            stat.statType,
                            stat.unitLabel,
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              disabled
              title="Próximamente"
              className="w-full mt-1 py-2.5 rounded-xl font-body text-sm font-medium text-on-surface-variant bg-surface-highest/50 cursor-not-allowed opacity-60"
            >
              Ver todos los encuentros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
