import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trophy } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { useGetMatch, useDeleteMatch } from '@/hooks/useMatches';
import { useAuthStore } from '@/store/auth.store';
import { formatStatValue } from '@/lib/utils';
import SaveResultsSheet from '@/components/matches/SaveResultsSheet';
import EditMatchSheet from '@/components/matches/EditMatchSheet';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { MatchLineup, MatchPlayerStat } from '@/types/match.types';

function formatMatchDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-EC', { timeZone: 'UTC' });
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const [saveResultsOpen, setSaveResultsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: match, isLoading, isError } = useGetMatch(id ?? '');
  const deleteMatch = useDeleteMatch();

  const canEdit = role === 'academy_director' || role === 'coach';
  const canDelete = role === 'academy_director';

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/matches')}
          className="self-start flex items-center gap-1.5 font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Encuentros
        </button>
        <EmptyState message="Encuentro no encontrado." />
      </div>
    );
  }

  const isTeamVs = match.matchType === 'team_vs';
  const hasScore = isTeamVs && match.scoreLocal !== null && match.scoreVisitor !== null;

  // Collect unique metrics from playerStats for the stats table header
  const metricIds = Array.from(new Set(match.playerStats.map((s) => s.metricId)));
  const metricsInMatch = metricIds.map((mid) => {
    const stat = match.playerStats.find((s) => s.metricId === mid)!;
    return {
      id: mid,
      name: stat.metricName,
      statType: stat.statType,
      unitLabel: stat.unitLabel,
    };
  });

  // Group stats by player for table display
  const statsByPlayer = match.lineups.map((lineup) => {
    const playerStats = match.playerStats.filter(
      (s) => s.playerId === lineup.playerId,
    );
    return { lineup, playerStats };
  });

  async function handleDelete() {
    await deleteMatch.mutateAsync(id!);
    navigate('/matches');
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Back + actions header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <button
            onClick={() => navigate('/matches')}
            className="flex items-center gap-1.5 font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <ChevronLeft size={16} />
            Encuentros
          </button>
          <div className="flex gap-2 flex-wrap">
            {canDelete && (
              <button
                onClick={() => setDeleteOpen(true)}
                className="h-10 px-4 rounded-xl font-body text-sm bg-error-container text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                Eliminar
              </button>
            )}
            {canEdit && (
              <>
                <button
                  onClick={() => setEditOpen(true)}
                  className="h-10 px-4 rounded-xl font-body font-medium text-sm bg-surface-highest text-primary hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Editar encuentro
                </button>
                <button
                  onClick={() => setSaveResultsOpen(true)}
                  className="h-10 px-5 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {match.lineups.length > 0 ? 'Editar resultados' : 'Cargar resultados'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero card */}
        <div className="bg-surface-high rounded-3xl overflow-hidden">
          <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body',
                      isTeamVs
                        ? 'bg-secondary-container text-white'
                        : 'bg-surface-highest text-on-surface-variant',
                    ].join(' ')}
                  >
                    {isTeamVs ? 'Vs Rival' : 'Individual'}
                  </span>
                </div>
                <h1 className="font-display text-[1.75rem] font-semibold text-on-surface leading-tight">
                  {isTeamVs && match.opponent
                    ? `${match.team.name} vs ${match.opponent}`
                    : match.team.name}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant font-body">
                  <span>{formatMatchDate(match.matchDate)}</span>
                  {match.location && <span>· {match.location}</span>}
                </div>
              </div>

              {/* Score */}
              {hasScore && (
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1">
                      Local
                    </p>
                    <span className="font-display text-[3.5rem] font-bold text-primary leading-none">
                      {match.scoreLocal}
                    </span>
                  </div>
                  <span className="font-display text-[2rem] font-bold text-on-surface-variant mt-4">
                    —
                  </span>
                  <div className="text-center">
                    <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1">
                      Visitante
                    </p>
                    <span className="font-display text-[3.5rem] font-bold text-primary leading-none">
                      {match.scoreVisitor}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {match.notes && (
              <p className="font-body text-sm text-on-surface-variant">
                {match.notes}
              </p>
            )}
          </div>
        </div>

        {/* Lineup section */}
        <div className="bg-surface-high rounded-3xl overflow-hidden">
          <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
          <div className="p-6">
            <h2 className="font-display text-lg font-semibold text-on-surface mb-4">
              Alineación
            </h2>
            {match.lineups.length === 0 ? (
              <EmptyState message="Aún no se han cargado los resultados." />
            ) : (
              <div className="flex flex-col gap-0 rounded-2xl overflow-hidden">
                {match.lineups.map((lineup: MatchLineup, i) => (
                  <div
                    key={lineup.playerId}
                    className={[
                      'flex items-center justify-between px-4 py-3',
                      i % 2 === 0 ? 'bg-surface-high' : 'bg-surface-highest',
                    ].join(' ')}
                  >
                    <span className="font-body text-sm text-on-surface">
                      {lineup.playerFullName}
                    </span>
                    <div className="flex items-center gap-3">
                      {lineup.minutesPlayed !== null && (
                        <span className="font-body text-xs text-on-surface-variant">
                          {lineup.minutesPlayed} min
                        </span>
                      )}
                      <span
                        className={[
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body',
                          lineup.isStarter
                            ? 'bg-primary/20 text-primary'
                            : 'bg-surface-highest text-on-surface-variant',
                        ].join(' ')}
                      >
                        {lineup.isStarter ? 'Titular' : 'Suplente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats section */}
        {match.playerStats.length > 0 && (
          <div className="bg-surface-high rounded-3xl overflow-hidden">
            <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
            <div className="p-6">
              <h2 className="font-display text-lg font-semibold text-on-surface mb-4">
                Estadísticas
              </h2>
              <div className="overflow-x-auto">
                {/* Header */}
                <div
                  className="grid bg-surface-lowest px-4 py-3 rounded-t-2xl min-w-max"
                  style={{
                    gridTemplateColumns: `180px repeat(${metricsInMatch.length}, 120px)`,
                  }}
                >
                  <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                    Jugador
                  </span>
                  {metricsInMatch.map((m) => (
                    <span
                      key={m.id}
                      className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
                {/* Rows */}
                {statsByPlayer.map(({ lineup, playerStats }, i) => (
                  <div
                    key={lineup.playerId}
                    className={[
                      'grid px-4 py-3 min-w-max',
                      i % 2 === 0 ? 'bg-surface-high' : 'bg-surface-highest',
                      i === statsByPlayer.length - 1 ? 'rounded-b-2xl' : '',
                    ].join(' ')}
                    style={{
                      gridTemplateColumns: `180px repeat(${metricsInMatch.length}, 120px)`,
                    }}
                  >
                    <span className="font-body text-sm text-on-surface">
                      {lineup.playerFullName}
                    </span>
                    {metricsInMatch.map((metric) => {
                      const s = playerStats.find(
                        (ps: MatchPlayerStat) => ps.metricId === metric.id,
                      );
                      return (
                        <span
                          key={metric.id}
                          className="font-body text-sm text-on-surface-variant"
                        >
                          {s
                            ? formatStatValue(
                                s.value,
                                s.boolValue,
                                s.statType,
                                s.unitLabel,
                              )
                            : '—'}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {match.playerStats.length === 0 && match.lineups.length > 0 && (
          <div className="bg-surface-high rounded-3xl overflow-hidden">
            <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
            <div className="p-6">
              <h2 className="font-display text-lg font-semibold text-on-surface mb-4">
                Estadísticas
              </h2>
              <EmptyState
                icon={<Trophy size={28} className="text-on-surface-variant" />}
                message="No hay estadísticas registradas para este encuentro."
              />
            </div>
          </div>
        )}
      </div>

      {canEdit && (
        <SaveResultsSheet
          open={saveResultsOpen}
          onOpenChange={setSaveResultsOpen}
          match={match}
        />
      )}

      {canEdit && (
        <EditMatchSheet
          open={editOpen}
          onOpenChange={setEditOpen}
          match={match}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar encuentro"
        description="¿Estás seguro de que deseas eliminar este encuentro? Se eliminará junto con toda la alineación y estadísticas registradas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        isLoading={deleteMatch.isPending}
        variant="destructive"
      />
    </>
  );
}
