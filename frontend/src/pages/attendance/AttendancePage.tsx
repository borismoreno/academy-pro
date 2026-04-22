import { useState } from "react";
import { CalendarDays } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { useAuthStore } from "@/store/auth.store";
import { useTeams } from "@/hooks/useTeams";
import { useAttendance } from "@/hooks/useAttendance";
import SessionCard from "./components/SessionCard";
import { SearchableSelect } from "@/components/shared/SearchableSelect";

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

  const [teamFilter, setTeamFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(getCurrentMonth());

  const monthOptions = getLast6Months();

  const { teams, isLoading: isLoadingTeams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  const filters = {
    teamId: teamFilter || undefined,
    month: monthFilter || undefined,
  };

  const { sessions, isLoading, deleteSessionMutation } = useAttendance(filters);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingSessions = [...sessions]
    .filter((s) => new Date(s.sessionDate) >= today)
    .sort(
      (a, b) =>
        new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
    );

  const pastSessions = [...sessions]
    .filter((s) => new Date(s.sessionDate) < today)
    .sort(
      (a, b) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
    );

  function handleTeamChange(teamId: string) {
    setTeamFilter(teamId);
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Team filter */}
        <div className="w-full sm:w-56">
          <SearchableSelect
            options={[
              { value: "all", label: "Todos los equipos" },
              ...activeTeams.map((t) => ({
                value: t.id,
                label: t.name,
                subtitle: t.category ?? undefined,
              })),
            ]}
            value={teamFilter || "all"}
            onValueChange={(val) => handleTeamChange(val === "all" ? "" : val)}
            placeholder="Todos los equipos"
            searchPlaceholder="Buscar equipo..."
            isLoading={isLoadingTeams}
          />
        </div>

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
      ) : sessions.length === 0 ? (
        <EmptyState
          message="No hay sesiones registradas para este período."
          icon={<CalendarDays size={48} />}
        />
      ) : (
        <div className="flex flex-col gap-8 mt-4">
          {pastSessions.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-[1.1rem] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">
                Sesiones anteriores
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {pastSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onDelete={(id) => deleteSessionMutation.mutate(id)}
                    isDeleting={deleteSessionMutation.isPending}
                    role={role}
                    currentUserId={user?.id ?? null}
                    currentUserName={user?.fullName ?? null}
                    isPending={false}
                  />
                ))}
              </div>
            </div>
          )}
          {upcomingSessions.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-[1.1rem] font-semibold text-on-surface-variant uppercase tracking-[0.05em]">
                Próximas sesiones
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onDelete={(id) => deleteSessionMutation.mutate(id)}
                    isDeleting={deleteSessionMutation.isPending}
                    role={role}
                    currentUserId={user?.id ?? null}
                    currentUserName={user?.fullName ?? null}
                    isPending={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
