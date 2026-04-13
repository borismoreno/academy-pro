import { Users, Calendar, TrendingUp } from 'lucide-react';
import type { PlayerResponse } from '@/services/portal.service';

interface PortalPlayerHeroProps {
  player: PlayerResponse | undefined;
  isLoading: boolean;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function SkeletonHero() {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="rounded-full bg-surface-highest flex-shrink-0" style={{ width: 80, height: 80 }} />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 bg-surface-highest rounded" />
            <div className="h-5 w-24 bg-surface-highest rounded-full" />
            <div className="h-4 w-36 bg-surface-highest rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalPlayerHero({ player, isLoading }: PortalPlayerHeroProps) {
  if (isLoading || !player) return <SkeletonHero />;

  const age = calculateAge(player.birthDate);

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      {/* Top glow */}
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {/* Avatar / Photo */}
          <div
            className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-surface-highest"
            style={{ width: 80, height: 80 }}
          >
            {player.photoUrl ? (
              <img
                src={player.photoUrl}
                alt={player.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="font-display font-bold text-primary leading-none"
                style={{ fontSize: '2rem' }}
              >
                {getInitials(player.fullName)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2 min-w-0">
            <h2 className="font-display text-[3.5rem] font-bold text-on-surface leading-none truncate">
              {player.fullName}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {player.position && (
                <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-secondary rounded-full px-3 py-1">
                  {player.position}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-1">
              {player.team && (
                <span className="flex items-center gap-1.5 font-body text-[0.875rem] text-on-surface-variant">
                  <Users size={14} className="flex-shrink-0" />
                  {player.team.name}
                </span>
              )}

              <span className="flex items-center gap-1.5 font-body text-[0.875rem] text-on-surface-variant">
                <Calendar size={14} className="flex-shrink-0" />
                {age} años
              </span>
            </div>

            <span className="flex items-center gap-1 font-body text-[0.6875rem] uppercase tracking-[0.05em] text-primary mt-1">
              <TrendingUp size={14} />
              Siguiendo su progreso
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
