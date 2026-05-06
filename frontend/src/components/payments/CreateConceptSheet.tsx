import { useState, useEffect } from "react";
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
import { DateSelector } from "@/components/shared/DateSelector";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useCreateConcept } from "@/hooks/usePayments";
import { useTeams } from "@/hooks/useTeams";
import { Info } from "lucide-react";

const INPUT_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50";

function todayAsISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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

interface FormContentProps {
  onSuccess: () => void;
}

function FormContent({ onSuccess }: FormContentProps) {
  const createConcept = useCreateConcept();
  const { teams, isLoading: isLoadingTeams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(todayAsISO());
  const [teamId, setTeamId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "El nombre es requerido";
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0)
      next.amount = "Ingresa un monto válido mayor a 0";
    if (!dueDate) next.dueDate = "La fecha límite es requerida";
    if (!teamId) next.teamId = "Selecciona un equipo";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await createConcept.mutateAsync(
      {
        name: name.trim(),
        amount: parseFloat(amount),
        dueDate,
        teamId: teamId || undefined,
      },
      { onSuccess },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Nombre del concepto
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: "" }));
          }}
          placeholder="Ej: Mensualidad Mayo 2025"
          className={INPUT_CLASS}
          disabled={createConcept.isPending}
        />
        {errors.name && (
          <p className="font-body text-xs text-error-container">
            {errors.name}
          </p>
        )}
      </div>

      {/* Monto */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Monto base
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-sm text-on-surface-variant pointer-events-none">
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((p) => ({ ...p, amount: "" }));
            }}
            placeholder="0.00"
            className={`${INPUT_CLASS} pl-8`}
            disabled={createConcept.isPending}
          />
        </div>
        {errors.amount && (
          <p className="font-body text-xs text-error-container">
            {errors.amount}
          </p>
        )}
      </div>

      {/* Fecha límite */}
      <div className="flex flex-col gap-1">
        <DateSelector
          label="Fecha límite"
          value={dueDate}
          onChange={(val) => {
            setDueDate(val);
            if (errors.dueDate) setErrors((p) => ({ ...p, dueDate: "" }));
          }}
          yearRange={{
            min: new Date().getFullYear(),
            max: new Date().getFullYear() + 5,
          }}
        />
        {errors.dueDate && (
          <p className="font-body text-xs text-error-container">
            {errors.dueDate}
          </p>
        )}
      </div>

      {/* Equipo */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Equipo
        </label>
        <SearchableSelect
          options={activeTeams.map((t) => ({
            value: t.id,
            label: t.name,
            subtitle: t.category ?? undefined,
          }))}
          value={teamId}
          onValueChange={(val) => {
            setTeamId(val);
            if (errors.teamId) setErrors((p) => ({ ...p, teamId: "" }));
          }}
          placeholder="Seleccionar equipo"
          searchPlaceholder="Buscar equipo..."
          isLoading={isLoadingTeams}
          disabled={createConcept.isPending}
        />
        {errors.teamId && (
          <p className="font-body text-xs text-error-container">
            {errors.teamId}
          </p>
        )}
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 bg-surface-highest rounded-xl p-4">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="font-body text-sm text-on-surface-variant">
          Se generará automáticamente un registro de pago por cada jugador
          activo del equipo seleccionado.
        </p>
      </div>

      {/* CTA */}
      <button
        type="submit"
        disabled={createConcept.isPending}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer sticky bottom-0"
      >
        {createConcept.isPending ? <LoadingSpinner size="sm" /> : null}
        Crear concepto
      </button>
    </form>
  );
}

interface CreateConceptSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateConceptSheet({
  open,
  onOpenChange,
}: CreateConceptSheetProps) {
  const isDesktop = useIsDesktop();

  function handleSuccess() {
    onOpenChange(false);
  }

  const title = "Nuevo concepto de pago";
  const content = <FormContent key={String(open)} onSuccess={handleSuccess} />;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-lg p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5 max-h-[90vh] overflow-y-auto">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-high border-0 rounded-t-3xl max-h-[95vh] overflow-y-auto p-0">
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
