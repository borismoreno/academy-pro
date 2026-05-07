import PageHeader from "@/components/shared/PageHeader";
import { useDashboard } from "@/hooks/useDashboard";
import KpiGrid from "./components/KpiGrid";
import HeroProgressBlock from "./components/HeroProgressBlock";
import QuickActions from "./components/QuickActions";
import TeamsList from "./components/TeamsList";

export default function DashboardPage() {
  const { teams, totalPlayers, recentEvaluations, isLoading, role } =
    useDashboard();

  const pageTitle =
    role === "academy_director" ? "Panel de control" : "Mi panel";

  return (
    // Mobile: flex column ordered for above-the-fold CTA
    // Desktop: 12-col grid, sections revert to original order via lg:order-{n}
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:gap-8">
      {/* PageHeader — mobile 1st, desktop 1st */}
      <div className="order-1 lg:col-span-12 lg:order-1">
        <PageHeader title={pageTitle} />
      </div>

      {/* HeroProgressBlock — mobile 2nd (CTA above fold), desktop 3rd */}
      <div className="order-2 lg:col-span-12 lg:order-3">
        <HeroProgressBlock />
      </div>

      {/* KpiGrid — mobile 3rd, desktop 2nd */}
      <div className="order-3 lg:col-span-12 lg:order-2">
        <KpiGrid
          totalTeams={teams.length}
          totalPlayers={totalPlayers}
          totalEvaluations={recentEvaluations.length}
          isLoading={isLoading}
        />
      </div>

      {/* QuickActions — mobile 4th, desktop 4th */}
      <div className="order-4 lg:col-span-12 lg:order-4">
        <QuickActions role={role} />
      </div>

      {/* RecentActivity — mobile 5th, desktop 5th (col-span-7) */}
      {/* <div className="order-5 lg:col-span-7 lg:order-5">
        <RecentActivity
          recentEvaluations={recentEvaluations}
          recentSessions={recentSessions}
          isLoading={isLoading}
        />
      </div> */}

      {/* TeamsList — mobile 6th, desktop 6th (col-span-5) */}
      <div className="order-6 lg:col-span-5 lg:order-6">
        <TeamsList teams={teams} isLoading={isLoading} />
      </div>
    </div>
  );
}
