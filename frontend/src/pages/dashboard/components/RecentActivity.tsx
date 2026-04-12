import { useState } from "react";
import { BarChart2, ClipboardList } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import type {
  EvaluationResponse,
  SessionListResponse,
  EvaluationScore,
} from "@/services/dashboard.service";

interface RecentActivityProps {
  recentEvaluations: EvaluationResponse[];
  recentSessions: SessionListResponse[];
  isLoading: boolean;
}

type ActivityItem =
  | { type: "evaluation"; data: EvaluationResponse; date: Date }
  | { type: "session"; data: SessionListResponse; date: Date };

/** Full format: "Hace 2 días" */
function getRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `Hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`;
  if (diffHours > 0)
    return `Hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  if (diffMinutes > 0)
    return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""}`;
  return "Ahora mismo";
}

/** Compact format for mobile: "Hace 2d", "Hace 3h", "Hace 5m" */
function getCompactRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `Hace ${diffDays}d`;
  if (diffHours > 0) return `Hace ${diffHours}h`;
  if (diffMinutes > 0) return `Hace ${diffMinutes}m`;
  return "Ahora";
}

function getAverageScore(scores: EvaluationScore[]): string | null {
  if (!scores.length) return null;
  const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  return avg.toFixed(1);
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <div
      className={`flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-2 lg:py-3 rounded-xl animate-pulse ${
        index % 2 === 0 ? "bg-surface-high" : "bg-surface-highest"
      }`}
    >
      <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-surface-highest shrink-0" />
      <div className="flex-1 space-y-1.5 lg:space-y-2">
        <div className="h-3 w-36 lg:w-48 bg-surface-highest rounded" />
        <div className="h-2.5 w-16 lg:w-24 bg-surface-highest rounded" />
      </div>
      {/* Chip skeleton — hidden on mobile */}
      <div className="hidden lg:block h-6 w-14 bg-surface-highest rounded-full shrink-0" />
    </div>
  );
}

const MOBILE_LIMIT = 4;

export default function RecentActivity({
  recentEvaluations,
  recentSessions,
  isLoading,
}: RecentActivityProps) {
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3 lg:space-y-4">
        <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
          Actividad reciente
        </h3>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} index={i} />
          ))}
        </div>
      </div>
    );
  }

  const allItems: ActivityItem[] = [
    ...recentEvaluations.map((e) => ({
      type: "evaluation" as const,
      data: e,
      date: new Date(e.evaluatedAt),
    })),
    ...recentSessions.map((s) => ({
      type: "session" as const,
      data: s,
      date: new Date(s.sessionDate),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  const hasMore = allItems.length > MOBILE_LIMIT;

  return (
    <div className="space-y-3 lg:space-y-4">
      <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
        Actividad reciente
      </h3>

      {allItems.length === 0 ? (
        <EmptyState message="No hay actividad reciente. Registra una sesión o evaluación para comenzar." />
      ) : (
        <>
          <div className="space-y-2">
            {allItems.map((item, index) => {
              const isEven = index % 2 === 0;
              const rowBg = isEven ? "bg-surface-high" : "bg-surface-highest";
              // On mobile, hide items beyond MOBILE_LIMIT unless expanded
              const hiddenOnMobile =
                index >= MOBILE_LIMIT && !showAll ? "hidden lg:flex" : "flex";

              if (item.type === "evaluation") {
                const avg = getAverageScore(item.data.scores);
                return (
                  <div
                    key={item.data.id}
                    className={`${hiddenOnMobile} items-center gap-3 lg:gap-4 px-3 lg:px-4 py-2 lg:py-3 rounded-xl ${rowBg}`}
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-surface-highest flex items-center justify-center shrink-0">
                      <BarChart2 size={14} className="text-primary" />
                    </div>

                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[0.875rem] text-on-surface truncate">
                        <span className="font-medium">
                          {item.data.player.fullName}
                        </span>
                        {" fue evaluado por "}
                        <span>{item.data.coach.fullName}</span>
                      </p>
                      <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-0.5">
                        {/* Compact on mobile, full on desktop */}
                        <span className="lg:hidden">
                          {getCompactRelativeTime(item.date)}
                        </span>
                        <span className="hidden lg:inline">
                          {getRelativeTime(item.date)}
                        </span>
                      </p>
                    </div>

                    {/* Chip — hidden on mobile */}
                    {avg !== null && (
                      <span className="hidden lg:flex shrink-0 px-3 py-1 rounded-full bg-primary-container text-on-primary font-body text-[0.6875rem] font-medium">
                        {avg}
                      </span>
                    )}
                  </div>
                );
              }

              // session
              const sessionDateStr = new Date(
                item.data.sessionDate,
              ).toLocaleDateString("es-EC");
              return (
                <div
                  key={item.data.id}
                  className={`${hiddenOnMobile} items-center gap-3 lg:gap-4 px-3 lg:px-4 py-2 lg:py-3 rounded-xl ${rowBg}`}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-surface-highest flex items-center justify-center shrink-0">
                    <ClipboardList size={14} className="text-secondary" />
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[0.875rem] text-on-surface truncate">
                      {"Sesión de "}
                      <span className="font-medium">{item.data.team.name}</span>
                      {` registrada el ${sessionDateStr}`}
                    </p>
                    <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-0.5">
                      <span className="lg:hidden">
                        {getCompactRelativeTime(item.date)}
                      </span>
                      <span className="hidden lg:inline">
                        {getRelativeTime(item.date)}
                      </span>
                    </p>
                  </div>

                  {/* Chip — hidden on mobile */}
                  <span className="hidden lg:flex shrink-0 px-3 py-1 rounded-full bg-secondary-container text-on-surface font-body text-[0.6875rem] font-medium whitespace-nowrap">
                    {item.data.totalPresent} presentes
                  </span>
                </div>
              );
            })}
          </div>

          {/* "Ver toda la actividad" — only on mobile when there are more items */}
          {hasMore && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="lg:hidden w-full min-h-11 font-body text-[0.875rem] text-on-surface-variant hover:text-primary transition-colors"
            >
              {showAll ? "Ver menos" : "Ver toda la actividad"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
