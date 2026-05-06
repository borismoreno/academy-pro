import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { useSaveMatchResults, useGetMetrics } from '@/hooks/useMatches';
import { usePlayers } from '@/hooks/usePlayers';
import { toast } from '@/hooks/use-toast';
import { formatSeconds } from '@/lib/utils';
import type {
  Match,
  MatchStatMetric,
  MatchLineupEntry,
  MatchPlayerStatEntry,
} from '@/types/match.types';
import type { PlayerResponse } from '@/services/players.service';

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}

// ── Lineup step ───────────────────────────────────────────────────────────────

interface LineupState {
  participated: boolean;
  minutesPlayed: string;
  isStarter: boolean;
}

interface LineupStepProps {
  players: PlayerResponse[];
  lineup: Record<string, LineupState>;
  onChange: (playerId: string, state: LineupState) => void;
}

function LineupStep({ players, lineup, onChange }: LineupStepProps) {
  if (players.length === 0) {
    return (
      <EmptyState message="No hay jugadores activos en este equipo." />
    );
  }

  return (
    <div className="flex flex-col gap-0 rounded-2xl overflow-hidden">
      {players.map((player, i) => {
        const state = lineup[player.id] ?? {
          participated: false,
          minutesPlayed: '',
          isStarter: false,
        };
        return (
          <div
            key={player.id}
            className={[
              'px-4 py-3',
              i % 2 === 0 ? 'bg-surface-high' : 'bg-surface-highest',
            ].join(' ')}
          >
            <div className="flex items-center gap-3">
              {/* Participated toggle */}
              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={state.participated}
                  onChange={(e) =>
                    onChange(player.id, {
                      ...state,
                      participated: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <span className="font-body text-sm text-on-surface truncate">
                  {player.fullName}
                </span>
              </label>

              {/* Minutes + starter — only if participated */}
              {state.participated && (
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={300}
                    placeholder="Min"
                    value={state.minutesPlayed}
                    onChange={(e) =>
                      onChange(player.id, {
                        ...state,
                        minutesPlayed: e.target.value,
                      })
                    }
                    className="w-16 bg-surface-low border border-outline-variant/15 rounded-lg px-2 py-1.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.isStarter}
                      onChange={(e) =>
                        onChange(player.id, {
                          ...state,
                          isStarter: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                    <span className="font-body text-xs text-on-surface-variant whitespace-nowrap">
                      Titular
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Stats step ────────────────────────────────────────────────────────────────

type StatValueState = Record<string, Record<string, { value: string; boolValue: boolean }>>;

interface StatInputProps {
  metric: MatchStatMetric;
  value: string;
  boolValue: boolean;
  onChange: (value: string, boolValue: boolean) => void;
}

function StatInput({ metric, value, boolValue, onChange }: StatInputProps) {
  if (metric.statType === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <div
          onClick={() => onChange('', !boolValue)}
          className={[
            'w-10 h-6 rounded-full transition-colors cursor-pointer relative',
            boolValue ? 'bg-primary' : 'bg-surface-highest',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              boolValue ? 'translate-x-5' : 'translate-x-1',
            ].join(' ')}
          />
        </div>
        <span className="font-body text-xs text-on-surface-variant">
          {boolValue ? 'Sí' : 'No'}
        </span>
      </label>
    );
  }

  if (metric.statType === 'time_seconds') {
    const totalSec = value !== '' ? parseInt(value, 10) : 0;
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;

    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={999}
          value={minutes || ''}
          placeholder="0"
          onChange={(e) => {
            const m = parseInt(e.target.value || '0', 10);
            const s = isNaN(parseInt(value, 10))
              ? 0
              : parseInt(value, 10) % 60;
            onChange(String(m * 60 + s), false);
          }}
          className="w-14 bg-surface-low border border-outline-variant/15 rounded-lg px-2 py-1.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary text-center"
        />
        <span className="text-on-surface-variant text-sm">:</span>
        <input
          type="number"
          min={0}
          max={59}
          value={seconds || ''}
          placeholder="00"
          onChange={(e) => {
            const s = Math.min(59, parseInt(e.target.value || '0', 10));
            const m = isNaN(parseInt(value, 10))
              ? 0
              : Math.floor(parseInt(value, 10) / 60);
            onChange(String(m * 60 + s), false);
          }}
          className="w-14 bg-surface-low border border-outline-variant/15 rounded-lg px-2 py-1.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary text-center"
        />
        {value !== '' && (
          <span className="text-xs text-on-surface-variant ml-1">
            ({formatSeconds(parseInt(value, 10))})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        max={metric.statType === 'rating' ? 10 : undefined}
        step={metric.statType === 'count' ? 1 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value, false)}
        placeholder="—"
        className="w-20 bg-surface-low border border-outline-variant/15 rounded-lg px-2 py-1.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
      />
      {metric.statType === 'rating' && (
        <span className="text-xs text-on-surface-variant">/10</span>
      )}
      {metric.unitLabel && metric.statType !== 'rating' && (
        <span className="text-xs text-on-surface-variant">{metric.unitLabel}</span>
      )}
    </div>
  );
}

interface StatsStepProps {
  selectedPlayers: PlayerResponse[];
  metrics: MatchStatMetric[];
  stats: StatValueState;
  onChange: (playerId: string, metricId: string, value: string, boolValue: boolean) => void;
}

function StatsStep({ selectedPlayers, metrics, stats, onChange }: StatsStepProps) {
  const activeMetrics = metrics.filter((m) => m.isActive);

  if (activeMetrics.length === 0) {
    return (
      <div className="bg-surface-highest rounded-2xl p-4">
        <p className="font-body text-sm text-on-surface-variant text-center">
          No hay métricas configuradas. El director puede agregarlas en Configuración → Métricas de encuentro.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {selectedPlayers.map((player) => (
        <div key={player.id} className="bg-surface-highest rounded-2xl p-4">
          <p className="font-body font-medium text-sm text-on-surface mb-3">
            {player.fullName}
          </p>
          <div className="flex flex-col gap-3">
            {activeMetrics.map((metric) => {
              const sv = stats[player.id]?.[metric.id] ?? {
                value: '',
                boolValue: false,
              };
              return (
                <div
                  key={metric.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="font-body text-xs text-on-surface-variant flex-1 min-w-0">
                    {metric.name}
                    {metric.unitLabel &&
                      metric.statType !== 'rating' &&
                      metric.statType !== 'boolean' && (
                        <span className="ml-1 text-on-surface-variant/50">
                          ({metric.unitLabel})
                        </span>
                      )}
                  </span>
                  <StatInput
                    metric={metric}
                    value={sv.value}
                    boolValue={sv.boolValue}
                    onChange={(v, b) => onChange(player.id, metric.id, v, b)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

interface FormContentProps {
  match: Match;
  onSuccess: () => void;
}

function FormContent({ match, onSuccess }: FormContentProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const { players: allPlayersRaw, isLoading: isLoadingPlayers } = usePlayers({
    teamId: match.team.id,
  });
  const activePlayers = (allPlayersRaw as PlayerResponse[]).filter((p) => p.isActive);

  const { data: metrics = [], isLoading: isLoadingMetrics } = useGetMetrics();

  const saveResults = useSaveMatchResults();

  // Pre-populate from existing lineup
  const [lineup, setLineup] = useState<Record<string, LineupState>>(() => {
    const init: Record<string, LineupState> = {};
    for (const l of match.lineups) {
      init[l.playerId] = {
        participated: true,
        minutesPlayed: l.minutesPlayed !== null ? String(l.minutesPlayed) : '',
        isStarter: l.isStarter,
      };
    }
    return init;
  });

  // Pre-populate from existing stats
  const [stats, setStats] = useState<StatValueState>(() => {
    const init: StatValueState = {};
    for (const s of match.playerStats) {
      if (!init[s.playerId]) init[s.playerId] = {};
      init[s.playerId][s.metricId] = {
        value: s.value !== null ? s.value : '',
        boolValue: s.boolValue ?? false,
      };
    }
    return init;
  });

  const selectedPlayers = activePlayers.filter(
    (p) => lineup[p.id]?.participated,
  );

  function handleLineupChange(playerId: string, state: LineupState) {
    setLineup((prev) => ({ ...prev, [playerId]: state }));
  }

  function handleStatChange(
    playerId: string,
    metricId: string,
    value: string,
    boolValue: boolean,
  ) {
    setStats((prev) => ({
      ...prev,
      [playerId]: {
        ...(prev[playerId] ?? {}),
        [metricId]: { value, boolValue },
      },
    }));
  }

  async function handleSave() {
    const lineups: MatchLineupEntry[] = selectedPlayers.map((p) => {
      const ls = lineup[p.id];
      return {
        playerId: p.id,
        minutesPlayed:
          ls.minutesPlayed !== '' ? parseInt(ls.minutesPlayed, 10) : undefined,
        isStarter: ls.isStarter,
      };
    });

    const activeMetrics = metrics.filter((m) => m.isActive);
    const statEntries: MatchPlayerStatEntry[] = [];
    for (const player of selectedPlayers) {
      for (const metric of activeMetrics) {
        const sv = stats[player.id]?.[metric.id];
        if (!sv) continue;
        if (metric.statType === 'boolean') {
          statEntries.push({
            playerId: player.id,
            metricId: metric.id,
            boolValue: sv.boolValue,
          });
        } else if (sv.value !== '') {
          statEntries.push({
            playerId: player.id,
            metricId: metric.id,
            value: parseFloat(sv.value),
          });
        }
      }
    }

    await saveResults.mutateAsync(
      { matchId: match.id, data: { lineups, stats: statEntries } },
      {
        onSuccess: () => {
          toast({ title: 'Resultados guardados exitosamente' });
          onSuccess();
        },
      },
    );
  }

  if (isLoadingPlayers || isLoadingMetrics) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 px-6 pb-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setStep(1)}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs transition-colors cursor-pointer',
            step === 1
              ? 'bg-primary text-on-primary'
              : 'bg-surface-highest text-on-surface-variant',
          ].join(' ')}
        >
          <span className="font-semibold">1</span> Alineación
        </button>
        <div className="h-px flex-1 bg-surface-highest" />
        <button
          onClick={() => selectedPlayers.length > 0 && setStep(2)}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs transition-colors',
            step === 2
              ? 'bg-primary text-on-primary cursor-pointer'
              : selectedPlayers.length > 0
              ? 'bg-surface-highest text-on-surface-variant cursor-pointer'
              : 'bg-surface-highest text-on-surface-variant/40 cursor-not-allowed',
          ].join(' ')}
        >
          <span className="font-semibold">2</span> Estadísticas
        </button>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <>
          <p className="font-body text-xs text-on-surface-variant mb-3">
            Marca los jugadores que participaron en este encuentro.
          </p>
          <LineupStep
            players={activePlayers}
            lineup={lineup}
            onChange={handleLineupChange}
          />
          <button
            onClick={() => {
              if (selectedPlayers.length === 0) {
                toast({
                  title: 'Selecciona al menos un jugador',
                  variant: 'destructive',
                });
                return;
              }
              setStep(2);
            }}
            className="mt-5 h-12 w-full rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary hover:opacity-90 transition-opacity cursor-pointer"
          >
            Siguiente →
          </button>
        </>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <>
          <p className="font-body text-xs text-on-surface-variant mb-3">
            Registra las estadísticas de cada jugador que participó.
          </p>
          <StatsStep
            selectedPlayers={selectedPlayers}
            metrics={metrics}
            stats={stats}
            onChange={handleStatChange}
          />
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setStep(1)}
              className="h-12 flex-1 rounded-xl font-body font-medium text-sm bg-surface-highest text-primary hover:opacity-90 transition-opacity cursor-pointer"
            >
              ← Atrás
            </button>
            <button
              onClick={handleSave}
              disabled={saveResults.isPending}
              className="h-12 flex-[2] rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {saveResults.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Guardar resultados'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

interface SaveResultsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match;
}

export default function SaveResultsSheet({
  open,
  onOpenChange,
  match,
}: SaveResultsSheetProps) {
  const isDesktop = useIsDesktop();
  const title = 'Resultados del encuentro';

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-none shadow-[0px_24px_48px_rgba(0,0,0,0.5)] rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary rounded-t-3xl" />
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              {title}
            </DialogTitle>
            <p className="font-body text-sm text-on-surface-variant">
              {match.team.name}
              {match.opponent ? ` vs ${match.opponent}` : ''} ·{' '}
              {new Date(match.matchDate).toLocaleDateString('es-EC', {
                timeZone: 'UTC',
              })}
            </p>
          </DialogHeader>
          <FormContent
            match={match}
            onSuccess={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <p className="font-body text-xs text-on-surface-variant px-6">
            {match.team.name}
            {match.opponent ? ` vs ${match.opponent}` : ''} ·{' '}
            {new Date(match.matchDate).toLocaleDateString('es-EC', {
              timeZone: 'UTC',
            })}
          </p>
        </SheetHeader>
        <FormContent
          match={match}
          onSuccess={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
