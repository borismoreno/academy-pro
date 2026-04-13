import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { toast } from '@/hooks/use-toast';
import { usePlayerDetail } from '@/hooks/usePlayerDetail';
import api from '@/services/api';
import type { ApiResponse } from '@/types';

interface AcademyMember {
  userId: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: string;
}

async function fetchParents(): Promise<AcademyMember[]> {
  const response = await api.get<ApiResponse<AcademyMember[]>>(
    '/academies/members?role=parent',
  );
  return response.data.data;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const RELATIONSHIP_OPTIONS = ['Padre', 'Madre', 'Tutor'];

interface FormBodyProps {
  playerId: string;
  onOpenChange: (open: boolean) => void;
}

function FormBody({ playerId, onOpenChange }: FormBodyProps) {
  const { addParentMutation } = usePlayerDetail(playerId);

  const { data: parents = [], isLoading } = useQuery({
    queryKey: ['academy-parents'],
    queryFn: fetchParents,
  });

  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [relationship, setRelationship] = useState('Padre');

  const filtered = parents.filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;

    addParentMutation.mutate(
      { userId: selectedUserId, relationship },
      {
        onSuccess: () => {
          toast({ description: 'Padre/tutor vinculado correctamente' });
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Search */}
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre..."
        disabled={addParentMutation.isPending}
      />

      {/* Parent list */}
      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto -mx-1 px-1">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={
              search
                ? 'No se encontraron padres/tutores con ese nombre.'
                : 'No hay padres o tutores registrados en esta academia.'
            }
          />
        ) : (
          filtered.map((parent) => (
            <button
              key={parent.userId}
              type="button"
              onClick={() => setSelectedUserId(parent.userId)}
              disabled={addParentMutation.isPending}
              className={`flex items-center gap-3 min-h-11 px-3 rounded-xl transition-colors text-left ${
                selectedUserId === parent.userId
                  ? 'bg-surface-highest'
                  : 'hover:bg-surface-highest'
              }`}
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-surface-highest flex items-center justify-center">
                <span className="font-body text-[0.6875rem] font-semibold text-primary">
                  {getInitials(parent.fullName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-on-surface truncate">
                  {parent.fullName}
                </p>
                <p className="font-body text-xs text-on-surface-variant truncate">
                  {parent.email}
                </p>
              </div>
              {selectedUserId === parent.userId && (
                <div className="shrink-0 w-4 h-4 rounded-full bg-primary" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Relationship select */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Relación con el jugador
        </label>
        <select
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          disabled={addParentMutation.isPending}
          className="w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary min-h-11 appearance-none cursor-pointer"
        >
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={addParentMutation.isPending || !selectedUserId}
        >
          {addParentMutation.isPending ? <LoadingSpinner size="sm" /> : null}
          Vincular
        </Button>
        <Button
          type="button"
          variant="tertiary"
          className="w-full"
          onClick={() => onOpenChange(false)}
          disabled={addParentMutation.isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
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

function TopGlow() {
  return (
    <div
      className="h-0.5 w-full"
      style={{ background: 'linear-gradient(135deg, #bcf521, #00f4fe)' }}
    />
  );
}

interface AddParentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
}

export default function AddParentSheet({
  open,
  onOpenChange,
  playerId,
}: AddParentSheetProps) {
  const isDesktop = useIsDesktop();
  const formKey = open ? playerId : 'closed';

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-120 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <TopGlow />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              Vincular padre/tutor
            </DialogTitle>
          </DialogHeader>
          <FormBody key={formKey} playerId={playerId} onOpenChange={onOpenChange} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-surface-high border-0 rounded-t-3xl max-h-[90vh] overflow-y-auto p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="font-display text-xl font-semibold text-on-surface">
            Vincular padre/tutor
          </SheetTitle>
        </SheetHeader>
        <FormBody key={formKey} playerId={playerId} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
