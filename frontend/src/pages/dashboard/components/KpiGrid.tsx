import type { ReactNode } from 'react';
import { Users, User, BarChart2 } from 'lucide-react';

interface KpiGridProps {
  totalTeams: number;
  totalPlayers: number;
  totalEvaluations: number;
  isLoading: boolean;
}

interface KpiCardProps {
  label: string;
  value: number;
  icon: ReactNode;
}

function KpiCard({ label, value, icon }: KpiCardProps) {
  return (
    <div className="bg-surface-high rounded-xl lg:rounded-[1.5rem] overflow-hidden">
      {/* Top glow — 1px on mobile, 2px on desktop */}
      <div className="h-px lg:h-[2px] w-full bg-gradient-to-r from-primary to-secondary" />

      <div className="p-3 lg:p-6 relative">
        {/* Icon — hidden on mobile to save space */}
        <div className="hidden lg:block absolute top-6 right-6 text-on-surface-variant">
          {icon}
        </div>

        {/* Label */}
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-2 lg:mb-3 leading-tight">
          {label}
        </p>

        {/* Value — headline-md on mobile, display-lg on desktop */}
        <p className="font-display text-[1.75rem] lg:text-[3.5rem] font-bold text-on-surface leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-high rounded-xl lg:rounded-[1.5rem] overflow-hidden animate-pulse">
      <div className="h-px lg:h-[2px] w-full bg-gradient-to-r from-primary to-secondary" />
      <div className="p-3 lg:p-6">
        <div className="h-2.5 w-16 lg:w-24 bg-surface-highest rounded mb-2 lg:mb-4" />
        <div className="h-7 lg:h-14 w-12 lg:w-16 bg-surface-highest rounded" />
      </div>
    </div>
  );
}

export default function KpiGrid({ totalTeams, totalPlayers, totalEvaluations, isLoading }: KpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-4">
      <KpiCard label="Equipos activos" value={totalTeams} icon={<Users size={20} />} />
      <KpiCard label="Jugadores registrados" value={totalPlayers} icon={<User size={20} />} />
      <KpiCard label="Evaluaciones realizadas" value={totalEvaluations} icon={<BarChart2 size={20} />} />
    </div>
  );
}
