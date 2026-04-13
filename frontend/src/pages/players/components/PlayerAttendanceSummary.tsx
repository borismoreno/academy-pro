import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import type { AttendanceSummary } from "@/services/players.service";

interface Props {
  summary: AttendanceSummary | undefined;
  isLoading: boolean;
}

export default function PlayerAttendanceSummary({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
        <div className="p-5 lg:p-6 flex justify-center py-12">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  const noData = !summary || summary.totalSessions === 0;

  const recentSessions = summary
    ? [...summary.sessions]
        .sort(
          (a, b) =>
            new Date(b.sessionDate).getTime() -
            new Date(a.sessionDate).getTime(),
        )
        .slice(0, 5)
    : [];

  const pct = summary?.attendancePercentage ?? 0;
  const pctColor =
    pct >= 80
      ? "text-primary"
      : pct >= 60
        ? "text-secondary"
        : "text-error-container";

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
      <div className="p-5 lg:p-6 flex flex-col gap-4">
        <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
          Asistencia
        </h3>

        {noData ? (
          <EmptyState message="Sin sesiones registradas." />
        ) : (
          <>
            {/* Big percentage */}
            <div>
              <span
                className={`font-display text-[3.5rem] font-bold leading-none ${pctColor}`}
              >
                {Math.round(pct)}%
              </span>
              <p className="mt-1 font-body text-sm text-on-surface-variant">
                {summary!.totalPresent} de {summary!.totalSessions} sesiones
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-surface-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>

            {/* Recent sessions */}
            {recentSessions.length > 0 && (
              <div className="flex flex-col gap-1">
                {recentSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between min-h-11"
                  >
                    <span className="font-body text-sm text-on-surface-variant">
                      {new Date(session.sessionDate).toLocaleDateString(
                        "es-EC",
                      )}
                    </span>
                    <span
                      className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-2 py-0.5 ${
                        session.present
                          ? "bg-primary-container text-on-primary"
                          : "bg-error-container text-on-surface"
                      }`}
                    >
                      {session.present ? "Presente" : "Ausente"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
