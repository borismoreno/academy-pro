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
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { useFields } from '@/hooks/useFields';
import type { Field } from '@/types';

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

// ── Form content ──────────────────────────────────────────────────────────────

interface FormContentProps {
  field: Field | null;
  onClose: () => void;
}

function FormContent({ field, onClose }: FormContentProps) {
  const isEditMode = field !== null;

  const [name, setName] = useState(field?.name ?? '');
  const [location, setLocation] = useState(field?.location ?? '');
  const [nameError, setNameError] = useState('');

  const { createFieldMutation, updateFieldMutation } = useFields();
  const isPending = createFieldMutation.isPending || updateFieldMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    setNameError('');

    const data = {
      name: trimmedName,
      ...(location.trim() ? { location: location.trim() } : {}),
    };

    if (isEditMode) {
      updateFieldMutation.mutate(
        { id: field.id, data },
        {
          onSuccess: () => {
            toast({ description: 'Cancha actualizada correctamente' });
            onClose();
          },
        },
      );
    } else {
      createFieldMutation.mutate(data, {
        onSuccess: () => {
          toast({ description: 'Cancha agregada correctamente' });
          onClose();
        },
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Nombre de la cancha <span className="text-error-container">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          placeholder="Ej: Cancha Principal"
          disabled={isPending}
          required
        />
        {nameError && (
          <p className="font-body text-xs text-error-container">{nameError}</p>
        )}
      </div>

      {/* Ubicación */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Ubicación
        </label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: Av. Principal y Calle 5"
          disabled={isPending}
        />
      </div>

      {/* CTA */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {isPending && <LoadingSpinner size="sm" />}
        {isEditMode ? 'Guardar cambios' : 'Agregar cancha'}
      </button>

      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="w-full flex items-center justify-center h-11 rounded-xl font-body text-sm text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50 cursor-pointer"
      >
        Cancelar
      </button>
    </form>
  );
}

// ── Sheet / Dialog wrapper ────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: Field | null;
}

export default function FieldFormSheet({ open, onOpenChange, field }: Props) {
  const isDesktop = useIsDesktop();
  const title = field ? 'Editar cancha' : 'Agregar cancha';

  const content = (
    <FormContent
      key={field?.id ?? 'new'}
      field={field}
      onClose={() => onOpenChange(false)}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-110 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-surface-high border-0 rounded-t-3xl max-h-[95vh] overflow-y-auto p-0"
      >
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="font-display text-xl font-semibold text-on-surface">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-5">{content}</div>
      </SheetContent>
    </Sheet>
  );
}
