import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { DateSelector } from '@/components/shared/DateSelector';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useCreateMatch } from '@/hooks/useMatches';
import { useTeams } from '@/hooks/useTeams';
import type { MatchType } from '@/types/match.types';

const INPUT_CLASS =
  'w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50';

const SELECT_CLASS =
  'w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer';

function todayAsISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

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

interface FormContentProps {
  onSuccess: (matchId: string) => void;
}

function FormContent({ onSuccess }: FormContentProps) {
  const createMatch = useCreateMatch();
  const { teams, isLoading: isLoadingTeams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  const [teamId, setTeamId] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('team_vs');
  const [opponent, setOpponent] = useState('');
  const [location, setLocation] = useState('');
  const [matchDate, setMatchDate] = useState(todayAsISO());
  const [scoreLocal, setScoreLocal] = useState('');
  const [scoreVisitor, setScoreVisitor] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!teamId) next.teamId = 'Selecciona un equipo';
    if (!matchType) next.matchType = 'Selecciona el tipo de encuentro';
    if (matchType === 'team_vs' && !opponent.trim())
      next.opponent = 'El rival es requerido para encuentros Vs Rival';
    if (!matchDate) next.matchDate = 'La fecha es requerida';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const created = await createMatch.mutateAsync({
      teamId,
      matchType,
      opponent: matchType === 'team_vs' ? opponent.trim() : undefined,
      location: location.trim() || undefined,
      matchDate,
      scoreLocal:
        matchType === 'team_vs' && scoreLocal !== ''
          ? parseInt(scoreLocal, 10)
          : undefined,
      scoreVisitor:
        matchType === 'team_vs' && scoreVisitor !== ''
          ? parseInt(scoreVisitor, 10)
          : undefined,
      notes: notes.trim() || undefined,
    });
    onSuccess(created.id);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 pb-8">
      {/* Team */}
      <div>
        <label className="font-body text-sm text-on-surface-variant mb-1.5 block">
          Equipo *
        </label>
        <SearchableSelect
          options={activeTeams.map((t) => ({
            value: t.id,
            label: t.name,
            subtitle: t.category ?? undefined,
          }))}
          value={teamId}
          onValueChange={setTeamId}
          placeholder="Selecciona un equipo"
          searchPlaceholder="Buscar equipo..."
          isLoading={isLoadingTeams}
        />
        {errors.teamId && (
          <p className="mt-1 text-xs text-red-400">{errors.teamId}</p>
        )}
      </div>

      {/* Match type */}
      <div>
        <label className="font-body text-sm text-on-surface-variant mb-1.5 block">
          Tipo de encuentro *
        </label>
        <select
          value={matchType}
          onChange={(e) => setMatchType(e.target.value as MatchType)}
          className={SELECT_CLASS}
        >
          <option value="team_vs" className="bg-surface-high">
            Equipo vs Rival
          </option>
          <option value="individual" className="bg-surface-high">
            Individual
          </option>
        </select>
      </div>

      {/* Opponent — only for team_vs */}
      {matchType === 'team_vs' && (
        <div>
          <label className="font-body text-sm text-on-surface-variant mb-1.5 block">
            Rival *
          </label>
          <input
            type="text"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            placeholder="Nombre del equipo rival"
            className={INPUT_CLASS}
          />
          {errors.opponent && (
            <p className="mt-1 text-xs text-red-400">{errors.opponent}</p>
          )}
        </div>
      )}

      {/* Date */}
      <DateSelector
        label="Fecha del encuentro *"
        value={matchDate}
        onChange={setMatchDate}
        yearRange={{ min: 2020, max: new Date().getFullYear() + 1 }}
      />
      {errors.matchDate && (
        <p className="-mt-3 text-xs text-red-400">{errors.matchDate}</p>
      )}

      {/* Location */}
      <div>
        <label className="font-body text-sm text-on-surface-variant mb-1.5 block">
          Lugar
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Estadio, cancha, ciudad..."
          className={INPUT_CLASS}
        />
      </div>

      {/* Score — only for team_vs */}
      {matchType === 'team_vs' && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-body text-sm text-on-surface-variant mb-1.5 block">
              Goles local
            </label>
            <input
              type="number"
              min={0}
              value={scoreLocal}
              onChange={(e) => setScoreLocal(e.target.value)}
              placeholder="0"
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex-1">
            <label className="font-body text-sm text-on-surface-variant mb-1.5 block">
              Goles visitante
            </label>
            <input
              type="number"
              min={0}
              value={scoreVisitor}
              onChange={(e) => setScoreVisitor(e.target.value)}
              placeholder="0"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="font-body text-sm text-on-surface-variant mb-1.5 block">
          Notas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones del encuentro..."
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={createMatch.isPending}
        className="mt-2 h-12 w-full rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {createMatch.isPending ? (
          <LoadingSpinner size="sm" />
        ) : (
          'Crear encuentro'
        )}
      </button>
    </form>
  );
}

interface CreateMatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateMatchSheet({
  open,
  onOpenChange,
}: CreateMatchSheetProps) {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  function handleSuccess(matchId: string) {
    onOpenChange(false);
    navigate(`/matches/${matchId}`);
  }

  const title = 'Nuevo encuentro';

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-none shadow-[0px_24px_48px_rgba(0,0,0,0.5)] rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary rounded-t-3xl" />
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              {title}
            </DialogTitle>
          </DialogHeader>
          <FormContent onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <FormContent onSuccess={handleSuccess} />
      </SheetContent>
    </Sheet>
  );
}
