import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { TimeSelector } from "@/components/shared/TimeSelector";
import { toast } from "@/hooks/use-toast";
import { useTeamDetail } from "@/hooks/useTeamDetail";
import { getFields } from "@/services/fields.service";
import type { DayOfWeek } from "@/types";

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
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
    queryKey: ["fields"],
    queryFn: getFields,
  });

  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("MONDAY");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [timeError, setTimeError] = useState("");

  // Derive effective fieldId: prefer explicit selection, fall back to first available
  const fieldId = selectedFieldId || (fields.length > 0 ? fields[0].id : "");

  function validate(): boolean {
    if (!startTime || !endTime) {
      setTimeError("Las horas de inicio y fin son requeridas");
      return false;
    }
    if (endTime <= startTime) {
      setTimeError("La hora de fin debe ser posterior a la hora de inicio");
      return false;
    }
    setTimeError("");
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    addScheduleMutation.mutate(
      { dayOfWeek, startTime, endTime, fieldId },
      {
        onSuccess: () => {
          toast({ description: "Horario agregado correctamente" });
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
        <label className="font-body text-sm text-on-surface-variant">
          Día de entrenamiento
        </label>
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
          disabled={isPending}
          className="flex h-11 w-full rounded-xl bg-surface-low px-4 py-2 font-body text-sm text-on-surface border border-outline-variant/15 focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50"
        >
          {DAY_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-surface-high"
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Start time */}
      <TimeSelector
        label="Hora de inicio"
        value={startTime}
        onChange={(val) => {
          setStartTime(val);
          if (timeError) setTimeError("");
        }}
      />

      {/* End time */}
      <div className="flex flex-col gap-1">
        <TimeSelector
          label="Hora de fin"
          value={endTime}
          onChange={(val) => {
            setEndTime(val);
            if (timeError) setTimeError("");
          }}
        />
        {timeError && (
          <p className="font-body text-xs text-error-container mt-1">
            {timeError}
          </p>
        )}
      </div>

      {/* Field */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Cancha
        </label>
        {fieldsLoading ? (
          <div className="flex items-center gap-2 py-2">
            <LoadingSpinner size="sm" />
            <span className="font-body text-sm text-on-surface-variant">
              Cargando canchas...
            </span>
          </div>
        ) : fields.length === 0 ? (
          <p className="font-body text-sm text-on-surface-variant">
            No hay canchas disponibles. Crea una cancha en Configuración.
          </p>
        ) : (
          <select
            value={fieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            disabled={isPending}
            className="flex h-11 w-full rounded-xl bg-surface-low px-4 py-2 font-body text-sm text-on-surface border border-outline-variant/15 focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50"
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id} className="bg-surface-high">
                {f.name}
                {f.location ? ` — ${f.location}` : ""}
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

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}

function TopGlow() {
  return (
    <div
      className="h-0.5 w-full rounded-t-3xl"
      style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
    />
  );
}

export default function AddScheduleSheet({
  open,
  onOpenChange,
  teamId,
}: AddScheduleSheetProps) {
  const isDesktop = useIsDesktop();
  const formKey = open ? teamId : "closed";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-120 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <TopGlow />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              Agregar horario
            </DialogTitle>
          </DialogHeader>
          <FormBody key={formKey} teamId={teamId} onOpenChange={onOpenChange} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-high border-0 rounded-t-3xl max-h-[90vh] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="font-display text-xl font-semibold text-on-surface">
            Agregar horario
          </SheetTitle>
        </SheetHeader>
        <FormBody key={formKey} teamId={teamId} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
