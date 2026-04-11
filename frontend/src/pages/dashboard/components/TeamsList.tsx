import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/shared/EmptyState';
import type { TeamResponse } from '@/services/dashboard.service';

interface TeamsListProps {
  teams: TeamResponse[];
  isLoading: boolean;
}

function SkeletonCard({ mobile }: { mobile: boolean }) {
  if (mobile) {
    return (
      <div className="w-[200px] flex-shrink-0 bg-surface-high rounded-xl overflow-hidden animate-pulse">
        <div className="h-px w-full bg-gradient-to-r from-primary to-secondary" />
        <div className="p-4 space-y-2.5">
          <div className="h-4 w-16 bg-surface-highest rounded" />
          <div className="h-2.5 w-12 bg-surface-highest rounded" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-surface-high rounded-[1.5rem] overflow-hidden animate-pulse">
      <div className="h-[2px] w-full bg-gradient-to-r from-primary to-secondary" />
      <div className="p-6 space-y-3">
        <div className="h-5 w-20 bg-surface-highest rounded" />
        <div className="h-3 w-14 bg-surface-highest rounded" />
        <div className="h-3 w-24 bg-surface-highest rounded mt-4" />
      </div>
    </div>
  );
}

export default function TeamsList({ teams, isLoading }: TeamsListProps) {
  const navigate = useNavigate();

  const title = (
    <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
      Mis equipos
    </h3>
  );

  if (isLoading) {
    return (
      <div className="space-y-3 lg:space-y-4">
        {title}
        {/* Mobile: horizontal scroll skeleton */}
        <div className="flex flex-row gap-3 overflow-x-auto pb-2 lg:hidden">
          <SkeletonCard mobile />
          <SkeletonCard mobile />
          <SkeletonCard mobile />
        </div>
        {/* Desktop: grid skeleton */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4">
          <SkeletonCard mobile={false} />
          <SkeletonCard mobile={false} />
          <SkeletonCard mobile={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-4">
      {title}

      {teams.length === 0 ? (
        <EmptyState message="No hay equipos registrados aún." />
      ) : (
        <>
          {/* Mobile: horizontal scroll with snap and fade hint */}
          <div className="relative lg:hidden">
            <div className="flex flex-row gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="w-[200px] flex-shrink-0 snap-start bg-surface-high rounded-xl overflow-hidden cursor-pointer hover:bg-surface-highest transition-colors"
                >
                  <div className="h-px w-full bg-gradient-to-r from-primary to-secondary" />
                  <div className="p-4 space-y-1.5">
                    <h4 className="font-display text-[1.25rem] font-semibold text-on-surface leading-tight truncate">
                      {team.name}
                    </h4>
                    {team.category && (
                      <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant truncate">
                        {team.category}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Right fade gradient hinting more cards */}
            <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-surface-low to-transparent pointer-events-none" />
          </div>

          {/* Desktop: grid layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const primaryCoach = team.coaches.find((c) => c.isPrimary);
              return (
                <div
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="bg-surface-high rounded-[1.5rem] overflow-hidden cursor-pointer hover:bg-surface-highest transition-colors"
                >
                  <div className="h-[2px] w-full bg-gradient-to-r from-primary to-secondary" />
                  <div className="p-6 space-y-2">
                    <h4 className="font-display text-[1.75rem] font-semibold text-on-surface leading-tight">
                      {team.name}
                    </h4>
                    {team.category && (
                      <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                        {team.category}
                      </p>
                    )}
                    {primaryCoach && (
                      <div className="pt-2 flex items-center gap-1.5">
                        <User size={14} className="text-on-surface-variant flex-shrink-0" />
                        <span className="font-body text-[0.875rem] text-on-surface-variant truncate">
                          {primaryCoach.user.fullName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
