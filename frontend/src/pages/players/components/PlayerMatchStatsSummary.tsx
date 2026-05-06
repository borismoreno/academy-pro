import { Trophy } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { useGetPlayerSeasonStats } from '@/hooks/useMatches';
import { formatStatValue } from '@/lib/utils';
import type { PlayerSeasonStat } from '@/types/match.types';

interface Props {
  playerId: string;
}

export default function PlayerMatchStatsSummary({ playerId }: Props) {
  const { data, isLoading } = useGetPlayerSeasonStats(playerId);

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
      <div className="p-6">
        <h2 className="font-display text-lg font-semibold text-on-surface mb-4">
          Estadísticas de encuentros
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : !data || data.matchesPlayed === 0 ? (
          <EmptyState
            icon={<Trophy size={28} className="text-on-surface-variant" />}
            message="Sin estadísticas de encuentros registradas."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="bg-surface-highest rounded-2xl p-4">
                <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1">
                  Encuentros
                </p>
                <p className="font-display text-[2rem] font-bold text-primary leading-none">
                  {data.matchesPlayed}
                </p>
              </div>
              <div className="bg-surface-highest rounded-2xl p-4">
                <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1">
                  Minutos
                </p>
                <p className="font-display text-[2rem] font-bold text-secondary leading-none">
                  {data.minutesPlayed}
                </p>
              </div>
            </div>

            {/* Stats table */}
            {data.statsByStat.length > 0 && (
              <div className="rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 bg-surface-lowest px-4 py-3">
                  <span className="col-span-2 font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                    Métrica
                  </span>
                  <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant text-right">
                    Total
                  </span>
                  <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant text-right">
                    Promedio
                  </span>
                </div>
                {data.statsByStat.map((stat: PlayerSeasonStat, i) => (
                  <div
                    key={stat.metricId}
                    className={[
                      'grid grid-cols-4 px-4 py-3',
                      i % 2 === 0 ? 'bg-surface-high' : 'bg-surface-highest',
                    ].join(' ')}
                  >
                    <span className="col-span-2 font-body text-sm text-on-surface">
                      {stat.metricName}
                    </span>
                    <span className="font-body text-sm text-on-surface-variant text-right">
                      {formatStatValue(stat.total, null, stat.statType, stat.unitLabel)}
                    </span>
                    <span className="font-body text-sm text-secondary text-right">
                      {formatStatValue(stat.average, null, stat.statType, stat.unitLabel)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
