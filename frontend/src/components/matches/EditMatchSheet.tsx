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
import { DateSelector } from '@/components/shared/DateSelector';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useUpdateMatch } from '@/hooks/useMatches';
import type { Match, MatchType } from '@/types/match.types';

const INPUT_CLASS =
  'w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50';

const SELECT_CLASS =
  'w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer';

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
  match: Match;
  onSuccess: () => void;
}

function FormContent({ match, onSuccess }: FormContentProps) {
  const updateMatch = useUpdateMatch();

  const initialDate = match.matchDate.substring(0, 10);

  const [matchType, setMatchType] = useState<MatchType>(match.matchType);
  const [opponent, setOpponent] = useState(match.opponent ?? '');
  const [location, setLocation] = useState(match.location ?? '');
  const [matchDate, setMatchDate] = useState(initialDate);
  const [scoreLocal, setScoreLocal] = useState(
    match.scoreLocal !== null ? String(match.scoreLocal) : '',
  );
  const [scoreVisitor, setScoreVisitor] = useState(
    match.scoreVisitor !== null ? String(match.scoreVisitor) : '',
  );
  const [notes, setNotes] = useState(match.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (matchType === 'team_vs' && !opponent.trim())
      next.opponent = 'El rival es requerido para encuentros Vs Rival';
    if (!matchDate) next.matchDate = 'La fecha es requerida';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await updateMatch.mutateAsync(
      {
        matchId: match.id,
        data: {
          matchType,
          opponent: matchType === 'team_vs' ? opponent.trim() || undefined : undefined,
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
        },
      },
      { onSuccess },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 pb-8">
      {/* Match type */}
      <div>
        <label className="font-body text-sm text-on-surface-variant mb-1.5 block">
          Tipo de encuentro
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

      <DateSelector
        label="Fecha del encuentro *"
        value={matchDate}
        onChange={setMatchDate}
        yearRange={{ min: 2020, max: new Date().getFullYear() + 1 }}
      />

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
        disabled={updateMatch.isPending}
        className="mt-2 h-12 w-full rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {updateMatch.isPending ? <LoadingSpinner size="sm" /> : 'Guardar cambios'}
      </button>
    </form>
  );
}

interface EditMatchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match;
}

export default function EditMatchSheet({
  open,
  onOpenChange,
  match,
}: EditMatchSheetProps) {
  const isDesktop = useIsDesktop();
  const title = 'Editar encuentro';

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
          <FormContent match={match} onSuccess={() => onOpenChange(false)} />
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
        <FormContent match={match} onSuccess={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
