import { ClipboardList, BarChart2, Activity, Wallet, Trophy } from "lucide-react";
import type {
  AttendanceSummary,
  EvaluationProgress,
  PortalPaymentRecord,
  PortalMatchEntry,
} from "@/services/portal.service";
import type { EvaluationScoreItem } from "@/services/players.service";
import { formatRelativeTime } from "@/lib/utils";

interface PortalRecentActivityProps {
  attendanceSummary: AttendanceSummary | undefined;
  evaluationProgress: EvaluationProgress | undefined;
  paymentRecords?: PortalPaymentRecord[];
  matchHistory?: PortalMatchEntry[];
  isLoading: boolean;
}

type ActivityItem =
  | { kind: "attendance"; date: string; present: boolean }
  | { kind: "evaluation"; date: string; scores: EvaluationScoreItem[] }
  | { kind: "payment"; date: string; conceptName: string }
  | { kind: "match"; date: string; opponent: string | null; matchType: string };

function averageScore(scores: EvaluationScoreItem[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
}

function buildFeed(
  attendance: AttendanceSummary | undefined,
  evaluation: EvaluationProgress | undefined,
  payments: PortalPaymentRecord[] | undefined,
  matches: PortalMatchEntry[] | undefined,
): ActivityItem[] {
  const attendanceItems: ActivityItem[] = (attendance?.sessions ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
    )
    .slice(0, 5)
    .map((s) => ({
      kind: "attendance",
      date: s.sessionDate,
      present: s.present,
    }));

  const evaluationItems: ActivityItem[] = (evaluation?.evaluations ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime(),
    )
    .slice(0, 3)
    .map((e) => ({
      kind: "evaluation",
      date: e.evaluatedAt,
      scores: e.scores,
    }));

  const paymentItems: ActivityItem[] = (payments ?? [])
    .filter((r) => r.status === "paid" && r.paidAt)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime(),
    )
    .slice(0, 3)
    .map((r) => ({
      kind: "payment",
      date: r.paidAt!,
      conceptName: r.concept.name,
    }));

  const matchItems: ActivityItem[] = (matches ?? [])
    .slice(0, 3)
    .map((m) => ({
      kind: "match",
      date: m.matchDate,
      opponent: m.opponent,
      matchType: m.matchType,
    }));

  return [...attendanceItems, ...evaluationItems, ...paymentItems, ...matchItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-3 py-3 animate-pulse">
      <div
        className="rounded-full bg-surface-highest shrink-0"
        style={{ width: 40, height: 40 }}
      />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-48 bg-surface-highest rounded" />
        <div className="h-2.5 w-24 bg-surface-highest rounded" />
      </div>
    </div>
  );
}

export default function PortalRecentActivity({
  attendanceSummary,
  evaluationProgress,
  paymentRecords,
  matchHistory,
  isLoading,
}: PortalRecentActivityProps) {
  const feed = buildFeed(
    attendanceSummary,
    evaluationProgress,
    paymentRecords,
    matchHistory,
  );

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5">
        <h3 className="font-display text-[1.75rem] font-semibold text-on-surface mb-4">
          Actividad reciente
        </h3>

        {isLoading ? (
          <div className="flex flex-col">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <Activity size={40} className="text-on-surface-variant" />
            <p className="font-body text-sm text-on-surface-variant">
              Sin actividad reciente.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {feed.map((item, idx) => {
              const isAlternate = idx % 2 === 1;
              const rowClass = [
                "flex items-center gap-4 px-3 py-3 rounded-xl",
                isAlternate ? "bg-surface-highest" : "bg-surface-high",
              ].join(" ");

              if (item.kind === "attendance") {
                return (
                  <div key={`att-${item.date}-${idx}`} className={rowClass}>
                    <div className="shrink-0 rounded-full p-2 bg-secondary/20">
                      <ClipboardList size={16} className="text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-on-surface">
                        Sesión de entrenamiento el{" "}
                        {new Date(item.date).toLocaleDateString("es-EC", {
                          timeZone: "UTC",
                        })}
                      </p>
                      <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-0.5">
                        {formatRelativeTime(item.date)}
                      </p>
                    </div>
                    <span
                      className={[
                        "shrink-0 font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-2 py-0.5",
                        item.present
                          ? "bg-primary-container text-on-primary"
                          : "bg-error-container text-on-surface",
                      ].join(" ")}
                    >
                      {item.present ? "Presente" : "Ausente"}
                    </span>
                  </div>
                );
              }

              if (item.kind === "evaluation") {
                const avg = averageScore(item.scores);
                return (
                  <div key={`eval-${item.date}-${idx}`} className={rowClass}>
                    <div className="shrink-0 rounded-full p-2 bg-primary/20">
                      <BarChart2 size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-on-surface">
                        Nueva evaluación disponible
                      </p>
                      <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-0.5">
                        {formatRelativeTime(item.date)}
                      </p>
                    </div>
                    <span className="shrink-0 bg-surface-highest text-primary font-body text-[0.6875rem] font-bold rounded-full px-3 py-1">
                      {avg.toFixed(1)}
                    </span>
                  </div>
                );
              }

              if (item.kind === "payment") {
                return (
                  <div key={`pay-${item.date}-${idx}`} className={rowClass}>
                    <div className="shrink-0 rounded-full p-2 bg-primary/20">
                      <Wallet size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-on-surface truncate">
                        Pago registrado: {item.conceptName}
                      </p>
                      <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-0.5">
                        {formatRelativeTime(item.date)}
                      </p>
                    </div>
                    <span className="shrink-0 bg-primary-container text-on-primary font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-2 py-0.5">
                      Pagado
                    </span>
                  </div>
                );
              }

              // match
              const matchLabel =
                item.matchType === "team_vs" && item.opponent
                  ? `vs ${item.opponent}`
                  : "Encuentro individual";
              return (
                <div key={`match-${item.date}-${idx}`} className={rowClass}>
                  <div className="shrink-0 rounded-full p-2 bg-secondary/20">
                    <Trophy size={16} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-on-surface truncate">
                      Participó en encuentro {matchLabel}
                    </p>
                    <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-0.5">
                      {formatRelativeTime(item.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
