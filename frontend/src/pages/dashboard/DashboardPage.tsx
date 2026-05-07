import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import { getInitials } from "@/lib/utils";
import EmptyState from "@/components/shared/EmptyState";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHeroTitle(pct: number): { prefix: string; suffix: string } {
  if (pct >= 80)
    return { prefix: "Tu academia va al", suffix: "de asistencia" };
  if (pct >= 60)
    return { prefix: "La asistencia este mes está en", suffix: "" };
  return { prefix: "Atención: solo el", suffix: "de asistencia este mes" };
}

function formatDay(date: Date): string {
  return String(date.getDate()).padStart(2, "0");
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("es-EC", { month: "short" });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TopGlow() {
  return (
    <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-surface-high rounded-3xl animate-pulse h-52" />
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-surface-high rounded-[18px] animate-pulse h-24" />
        <div className="bg-surface-high rounded-[18px] animate-pulse h-24" />
        <div className="bg-surface-high rounded-[18px] animate-pulse h-24" />
      </div>
      <div className="bg-surface-high rounded-2xl animate-pulse h-36" />
      <div className="bg-surface-high rounded-2xl animate-pulse h-36" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const navigate = useNavigate();
  const lowAttendanceRef = useRef<HTMLDivElement>(null);

  const {
    attendancePercent,
    activeTeams,
    activePlayers,
    activeCoaches,
    upcomingSessions,
    lowAttendancePlayers,
    isLoading,
    isError,
  } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <EmptyState
        message="Error al cargar el dashboard"
        action={
          <button
            onClick={() => window.location.reload()}
            className="bg-linear-to-br from-primary to-secondary text-on-primary font-semibold text-sm rounded-xl px-4 py-2"
          >
            Reintentar
          </button>
        }
      />
    );
  }

  const { prefix, suffix } = getHeroTitle(attendancePercent);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Hero Card ─────────────────────────────────────────── */}
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <TopGlow />
        <div className="p-5">
          <p className="font-body text-[10px] uppercase tracking-[0.08em] text-on-surface-variant mb-1.5">
            Resumen del mes
          </p>

          <h1 className="font-display text-[26px] font-bold leading-tight mb-4">
            {prefix}
            <br />
            <span className="text-primary">{attendancePercent}%</span>
            {suffix ? (
              <>
                {" "}
                <span className="text-on-surface">{suffix}</span>
              </>
            ) : null}
          </h1>

          <div className="flex gap-2 mb-4 flex-wrap">
            {lowAttendancePlayers.length > 0 && (
              <div className="flex items-center gap-1.5 bg-error-container/20 border border-error-container/40 rounded-full px-3 py-1.5 text-[12px] text-red-400">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                {lowAttendancePlayers.length} jugadores en riesgo
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5 text-[12px] text-primary">
              ✓ {activeTeams} equipos activos
            </div>
          </div>

          {lowAttendancePlayers.length > 0 ? (
            <button
              onClick={() =>
                lowAttendanceRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="w-full bg-linear-to-br from-primary to-secondary text-on-primary font-display font-semibold text-[14px] rounded-xl py-3.5 flex items-center justify-center gap-1.5"
            >
              Ver jugadores en riesgo →
            </button>
          ) : (
            <div className="w-full bg-primary/10 border border-primary/20 rounded-xl py-3.5 text-center text-primary font-semibold text-[14px]">
              ✓ Todo en orden este mes
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        {(
          [
            {
              label: "Jugadores",
              value: activePlayers,
              sub: "activos",
              accent: true,
            },
            {
              label: "Asistencia",
              value: `${attendancePercent}%`,
              sub: "este mes",
              accent: false,
            },
            {
              label: "Coaches",
              value: activeCoaches,
              sub: "asignados",
              accent: false,
            },
          ] as const
        ).map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-high rounded-[18px] p-3.5 relative overflow-hidden"
          >
            <TopGlow />
            <p className="font-body text-[9px] uppercase tracking-[0.06em] text-on-surface-variant mt-0.5 mb-1.5">
              {stat.label}
            </p>
            <p
              className={`font-display text-[28px] font-bold leading-none ${
                stat.accent ? "text-primary" : "text-on-surface"
              }`}
            >
              {stat.value}
            </p>
            <p className="font-body text-[10px] text-on-surface-variant mt-1">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Baja asistencia ───────────────────────────────────── */}
      <div ref={lowAttendanceRef}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display text-[16px] font-semibold">
            {lowAttendancePlayers.length > 0
              ? "⚠️ Baja asistencia"
              : "✅ Asistencia al día"}
          </h2>
          <button
            onClick={() => navigate("/attendance")}
            className="text-[12px] text-primary"
          >
            Ver todos
          </button>
        </div>

        {lowAttendancePlayers.length === 0 ? (
          <div className="bg-surface-high rounded-2xl p-4 text-center text-on-surface-variant text-[13px]">
            Todos los jugadores tienen buena asistencia este mes 🎉
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {lowAttendancePlayers.slice(0, 5).map((player) => (
              <div
                key={player.id}
                onClick={() => navigate(`/players/${player.id}`)}
                className="bg-surface-high rounded-2xl px-3.5 py-3 flex items-center gap-3 cursor-pointer active:bg-surface-highest transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-surface-highest flex items-center justify-center font-display text-[12px] font-semibold text-on-surface-variant shrink-0">
                  {getInitials(player.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-on-surface truncate">
                    {player.fullName}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {player.teamName}
                    {player.position ? ` · ${player.position}` : ""}
                  </p>
                </div>
                <div className="bg-error-container/20 border border-error-container/30 rounded-lg px-2 py-1 font-display text-[13px] font-bold text-red-400 shrink-0">
                  {player.attendancePercent}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Próximos entrenamientos ───────────────────────────── */}
      <div className="pb-2">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-display text-[16px] font-semibold">
            Próximos entrenamientos
          </h2>
          <button
            onClick={() => navigate("/attendance")}
            className="text-[12px] text-primary"
          >
            Ver todos
          </button>
        </div>

        {upcomingSessions.length === 0 ? (
          <EmptyState message="No hay entrenamientos programados próximamente" />
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingSessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="bg-surface-high rounded-2xl p-3.5 flex items-center gap-3.5"
              >
                <div className="bg-surface-highest rounded-[10px] px-2.5 py-2 text-center shrink-0 min-w-11">
                  <p className="font-display text-[18px] font-bold text-primary leading-none">
                    {formatDay(session.date)}
                  </p>
                  <p className="font-body text-[9px] text-on-surface-variant uppercase tracking-[0.06em] mt-0.5">
                    {formatMonth(session.date)}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-on-surface truncate">
                    {session.teamName}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {session.fieldName ?? "Sin cancha"}
                    {session.playerCount > 0
                      ? ` · ${session.playerCount} jugadores`
                      : ""}
                  </p>
                </div>
                <p className="font-display text-[13px] font-semibold text-secondary shrink-0">
                  {session.startTime}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
