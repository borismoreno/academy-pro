import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { useAuthStore } from "@/store/auth.store";
import { useTeams } from "@/hooks/useTeams";
import { useAttendance } from "@/hooks/useAttendance";
import SessionCard from "./components/SessionCard";
import SessionFormSheet from "./components/SessionFormSheet";

const SELECT_CLASS =
  "bg-surface-high border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary min-h-11 appearance-none cursor-pointer";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getLast6Months(): { label: string; value: string }[] {
  const result = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("es-EC", { month: "long", year: "numeric" });
    const formatted = label.charAt(0).toUpperCase() + label.slice(1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ label: formatted, value });
  }
  return result;
}

export default function AttendancePage() {
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);

  const [searchParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [teamFilter, setTeamFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(getCurrentMonth());

  const monthOptions = getLast6Months();

  const { teams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  const filters = {
    teamId: teamFilter || undefined,
    month: monthFilter || undefined,
  };

  const { sessions, isLoading, deleteSessionMutation } = useAttendance(filters);

  const canRegister = role === "academy_director" || role === "coach";

  // Auto-open sheet when ?action=create is present
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setSheetOpen(true);
    }
  }, [searchParams]);

  const sortedSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Asistencia"
        action={
          canRegister ? (
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 h-11 px-5 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap"
            >
              Registrar sesión
            </button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Team filter */}
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">Todos los equipos</option>
          {activeTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        {/* Month filter */}
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className={SELECT_CLASS}
        >
          {monthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : sortedSessions.length === 0 ? (
        <EmptyState
          message="No hay sesiones registradas para este período."
          icon={<CalendarDays size={48} />}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {sortedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={(id) => deleteSessionMutation.mutate(id)}
              isDeleting={deleteSessionMutation.isPending}
              role={role}
              currentUserId={user?.id ?? null}
              currentUserName={user?.fullName ?? null}
            />
          ))}
        </div>
      )}

      <SessionFormSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
