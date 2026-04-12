import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { useTeams } from '@/hooks/useTeams';
import type { TeamResponse } from '@/services/dashboard.service';

interface TeamFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamResponse | null;
}

// Separated so key-based remounting resets all form state when open changes
interface FormBodyProps {
  team: TeamResponse | null;
  onOpenChange: (open: boolean) => void;
}

function FormBody({ team, onOpenChange }: FormBodyProps) {
  const isEditMode = team !== null;
  const { createTeamMutation, updateTeamMutation } = useTeams();

  const [name, setName] = useState(team?.name ?? '');
  const [category, setCategory] = useState(team?.category ?? '');
  const [nameError, setNameError] = useState('');

  const isPending = createTeamMutation.isPending || updateTeamMutation.isPending;

  function validate(): boolean {
    if (name.trim().length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
      return false;
    }
    setNameError('');
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isEditMode && team) {
      updateTeamMutation.mutate(
        { id: team.id, data: { name: name.trim(), category: category.trim() } },
        {
          onSuccess: () => {
            toast({ description: 'Equipo actualizado correctamente' });
            onOpenChange(false);
          },
        },
      );
    } else {
      createTeamMutation.mutate(
        { name: name.trim(), category: category.trim() },
        {
          onSuccess: () => {
            toast({ description: 'Equipo creado correctamente' });
            onOpenChange(false);
          },
        },
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[0.875rem] text-on-surface-variant">
          Nombre del equipo
        </label>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          placeholder="Ej. U14 Azul"
          disabled={isPending}
        />
        {nameError && (
          <p className="font-body text-[0.75rem] text-error-container">{nameError}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[0.875rem] text-on-surface-variant">
          Categoría
        </label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Ej. Sub 14"
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? <LoadingSpinner size="sm" /> : null}
          {isEditMode ? 'Guardar cambios' : 'Crear equipo'}
        </Button>
        <Button
          type="button"
          variant="tertiary"
          className="w-full"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function TeamFormSheet({ open, onOpenChange, team }: TeamFormSheetProps) {
  const isEditMode = team !== null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Editar equipo' : 'Crear equipo'}</SheetTitle>
        </SheetHeader>
        {/* key forces remount when sheet opens/closes, resetting form state */}
        <FormBody key={open ? (team?.id ?? 'new') : 'closed'} team={team} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
