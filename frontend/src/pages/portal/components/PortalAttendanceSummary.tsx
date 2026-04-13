import type { AttendanceSummary } from '@/services/portal.service';

interface PortalAttendanceSummaryProps {
  summary: AttendanceSummary | undefined;
  isLoading: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-5 space-y-4">
        <div className="h-2.5 w-20 bg-surface-highest rounded" />
        <div className="h-12 w-24 bg-surface-highest rounded" />
        <div className="h-4 w-32 bg-surface-highest rounded" />
        <div className="h-1.5 w-full bg-surface-highest rounded-full" />
        <div className="h-2.5 w-28 bg-surface-highest rounded" />
      </div>
    </div>
  );
}

function scoreColor(pct: number): string {
  if (pct >= 80) return 'text-primary';
  if (pct >= 60) return 'text-secondary';
  return 'text-error-container';
}

function assessment(pct: number): { text: string; color: string } {
  if (pct >= 80) return { text: '¡Excelente asistencia!', color: 'text-primary' };
  if (pct >= 60) return { text: 'Asistencia regular', color: 'text-secondary' };
  return { text: 'Necesita mejorar', color: 'text-error-container' };
}

export default function PortalAttendanceSummary({
  summary,
  isLoading,
}: PortalAttendanceSummaryProps) {
  if (isLoading) return <SkeletonCard />;

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      {/* Top glow */}
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5 flex flex-col gap-3">
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
          Asistencia
        </p>

        {!summary || summary.totalSessions === 0 ? (
          <p className="font-body text-sm text-on-surface-variant">Sin sesiones aún</p>
        ) : (
          <>
            {/* Big percentage */}
            <p
              className={[
                'font-display text-5xl font-bold leading-none',
                scoreColor(summary.attendancePercentage),
              ].join(' ')}
            >
              {Math.round(summary.attendancePercentage)}%
            </p>

            <p className="font-body text-sm text-on-surface-variant">
              {summary.totalPresent} de {summary.totalSessions} sesiones
            </p>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-surface-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(summary.attendancePercentage, 100)}%` }}
              />
            </div>

            {/* Assessment */}
            <p
              className={[
                'font-body text-[0.6875rem] uppercase tracking-[0.05em]',
                assessment(summary.attendancePercentage).color,
              ].join(' ')}
            >
              {assessment(summary.attendancePercentage).text}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
