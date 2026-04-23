import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { NextSession } from "@/services/portal.service";

interface Props {
  nextSession: NextSession | null | undefined;
  isLoading: boolean;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

function formatNextDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const diffDays = Math.round(
    (date.getTime() - todayUTC.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays < 7) return `En ${diffDays} días`;
  return date.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function SkeletonCard() {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-5 space-y-3">
        <div className="h-2.5 w-32 bg-surface-highest rounded" />
        <div className="h-8 w-24 bg-surface-highest rounded" />
        <div className="h-4 w-40 bg-surface-highest rounded" />
        <div className="h-4 w-36 bg-surface-highest rounded" />
      </div>
    </div>
  );
}

export default function PortalNextSession({ nextSession, isLoading }: Props) {
  if (isLoading) return <SkeletonCard />;

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-5 flex flex-col gap-3">
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
          Próximo entrenamiento
        </p>

        {!nextSession ? (
          <p className="font-body text-sm text-on-surface-variant">
            Sin entrenamientos programados
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-primary shrink-0" />
              <p className="font-display text-xl font-semibold text-on-surface">
                {DAY_LABELS[nextSession.dayOfWeek]}
              </p>
              <span className="font-body text-sm text-on-surface-variant">
                — {formatNextDate(nextSession.nextDate)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={14} className="text-on-surface-variant shrink-0" />
              <span className="font-body text-sm text-on-surface-variant">
                {nextSession.startTime} – {nextSession.endTime}
              </span>
            </div>

            {nextSession.fieldName && (
              <div className="flex items-center gap-2">
                <MapPin
                  size={14}
                  className="text-on-surface-variant shrink-0"
                />
                <span className="font-body text-sm text-on-surface-variant">
                  {nextSession.fieldName}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
