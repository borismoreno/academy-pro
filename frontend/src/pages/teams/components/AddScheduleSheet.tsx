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
import { toast } from '@/hooks/use-toast';
import { useTeamDetail } from '@/hooks/useTeamDetail';
import { getFields } from '@/services/fields.service';
import type { DayOfWeek } from '@/types';

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

interface AddScheduleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

interface FormBodyProps {
  teamId: string;
  onOpenChange: (open: boolean) => void;
}

function FormBody({ teamId, onOpenChange }: FormBodyProps) {
  const { addScheduleMutation } = useTeamDetail(teamId);

  const { data: fields = [], isLoading: fieldsLoading } = useQuery({
    queryKey: ['fields'],
    queryFn: getFields,
  });

  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [timeError, setTimeError] = useState('');

  // Derive effective fieldId: prefer explicit selection, fall back to first available
  const fieldId = selectedFieldId || (fields.length > 0 ? fields[0].id : '');

  function validate(): boolean {
    if (!startTime || !endTime) {
      setTimeError('Las horas de inicio y fin son requeridas');
      return false;
    }
    if (endTime <= startTime) {
      setTimeError('La hora de fin debe ser posterior a la hora de inicio');
      return false;
    }
    setTimeError('');
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    addScheduleMutation.mutate(
      { dayOfWeek, startTime, endTime, fieldId },
      {
        onSuccess: () => {
          toast({ description: 'Horario agregado correctamente' });
          onOpenChange(false);
        },
      },
    );
  }

  const isPending = addScheduleMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Day of week */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[0.875rem] text-on-surface-variant">
          Día de entrenamiento
        </label>
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
          disabled={isPending}
          className="flex h-11 w-full rounded-xl bg-surface-low px-4 py-2 font-body text-[0.875rem] text-on-surface border border-outline-variant/15 focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50"
        >
          {DAY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-high">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Start time */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[0.875rem] text-on-surface-variant">
          Hora de inicio
        </label>
        <Input
          type="time"
          value={startTime}
          onChange={(e) => {
            setStartTime(e.target.value);
            if (timeError) setTimeError('');
          }}
          disabled={isPending}
        />
      </div>

      {/* End time */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[0.875rem] text-on-surface-variant">
          Hora de fin
        </label>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => {
            setEndTime(e.target.value);
            if (timeError) setTimeError('');
          }}
          disabled={isPending}
        />
        {timeError && (
          <p className="font-body text-[0.75rem] text-error-container">{timeError}</p>
        )}
      </div>

      {/* Field */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[0.875rem] text-on-surface-variant">
          Cancha
        </label>
        {fieldsLoading ? (
          <div className="flex items-center gap-2 py-2">
            <LoadingSpinner size="sm" />
            <span className="font-body text-[0.875rem] text-on-surface-variant">
              Cargando canchas...
            </span>
          </div>
        ) : fields.length === 0 ? (
          <p className="font-body text-[0.875rem] text-on-surface-variant">
            No hay canchas disponibles. Crea una cancha en Configuración.
          </p>
        ) : (
          <select
            value={fieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            disabled={isPending}
            className="flex h-11 w-full rounded-xl bg-surface-low px-4 py-2 font-body text-[0.875rem] text-on-surface border border-outline-variant/15 focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id} className="bg-surface-high">
                {f.name}{f.location ? ` — ${f.location}` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isPending || fieldsLoading || fields.length === 0}
        >
          {isPending ? <LoadingSpinner size="sm" /> : null}
          Agregar horario
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

export default function AddScheduleSheet({ open, onOpenChange, teamId }: AddScheduleSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Agregar horario</SheetTitle>
        </SheetHeader>
        <FormBody key={open ? teamId : 'closed'} teamId={teamId} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
