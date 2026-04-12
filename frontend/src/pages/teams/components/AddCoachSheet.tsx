import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { toast } from '@/hooks/use-toast';
import { useTeamDetail } from '@/hooks/useTeamDetail';
import api from '@/services/api';
import type { ApiResponse } from '@/types';

interface AcademyMember {
  userId: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: string;
}

async function fetchCoaches(): Promise<AcademyMember[]> {
  const response = await api.get<ApiResponse<AcademyMember[]>>(
    '/academies/members?role=coach',
  );
  return response.data.data;
}

interface AddCoachSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

interface FormBodyProps {
  teamId: string;
  onOpenChange: (open: boolean) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function FormBody({ teamId, onOpenChange }: FormBodyProps) {
  const { addCoachMutation } = useTeamDetail(teamId);

  const { data: coaches = [], isLoading } = useQuery({
    queryKey: ['academy-coaches'],
    queryFn: fetchCoaches,
  });

  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const filtered = coaches.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;

    addCoachMutation.mutate(
      { userId: selectedUserId, isPrimary },
      {
        onSuccess: () => {
          toast({ description: 'Entrenador agregado correctamente' });
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
        placeholder="Buscar entrenador..."
        disabled={addCoachMutation.isPending}
      />

      {/* Coach list */}
      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto -mx-1 px-1">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            message={
              search
                ? 'No se encontraron entrenadores con ese nombre.'
                : 'No hay entrenadores registrados en esta academia.'
            }
          />
        ) : (
          filtered.map((coach) => (
            <button
              key={coach.userId}
              type="button"
              onClick={() => setSelectedUserId(coach.userId)}
              disabled={addCoachMutation.isPending}
              className={`flex items-center gap-3 min-h-[44px] px-3 rounded-xl transition-colors text-left ${
                selectedUserId === coach.userId
                  ? 'bg-surface-highest'
                  : 'hover:bg-surface-highest'
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-highest flex items-center justify-center">
                <span className="font-body text-[0.6875rem] font-semibold text-primary">
                  {getInitials(coach.fullName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[0.875rem] text-on-surface truncate">
                  {coach.fullName}
                </p>
                <p className="font-body text-[0.75rem] text-on-surface-variant truncate">
                  {coach.email}
                </p>
              </div>
              {/* Selection indicator */}
              {selectedUserId === coach.userId && (
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary" />
              )}
            </button>
          ))
        )}
      </div>

      {/* isPrimary toggle */}
      <div className="flex items-center justify-between min-h-[44px]">
        <span className="font-body text-[0.875rem] text-on-surface-variant">
          Entrenador principal
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isPrimary}
          onClick={() => setIsPrimary((prev) => !prev)}
          disabled={addCoachMutation.isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            isPrimary ? 'bg-primary' : 'bg-surface-highest'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-on-primary transition-transform ${
              isPrimary ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={addCoachMutation.isPending || !selectedUserId}
        >
          {addCoachMutation.isPending ? <LoadingSpinner size="sm" /> : null}
          Agregar entrenador
        </Button>
        <Button
          type="button"
          variant="tertiary"
          className="w-full"
          onClick={() => onOpenChange(false)}
          disabled={addCoachMutation.isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function AddCoachSheet({ open, onOpenChange, teamId }: AddCoachSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Agregar entrenador</SheetTitle>
        </SheetHeader>
        <FormBody key={open ? teamId : 'closed'} teamId={teamId} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
