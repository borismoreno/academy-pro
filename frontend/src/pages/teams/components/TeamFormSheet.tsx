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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { toast } from "@/hooks/use-toast";
import { useTeams } from "@/hooks/useTeams";
import type { TeamResponse } from "@/services/dashboard.service";

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

  const [name, setName] = useState(team?.name ?? "");
  const [category, setCategory] = useState(team?.category ?? "");
  const [nameError, setNameError] = useState("");

  const isPending =
    createTeamMutation.isPending || updateTeamMutation.isPending;

  function validate(): boolean {
    if (name.trim().length < 2) {
      setNameError("El nombre debe tener al menos 2 caracteres");
      return false;
    }
    setNameError("");
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
            toast({ description: "Equipo actualizado correctamente" });
            onOpenChange(false);
          },
        },
      );
    } else {
      createTeamMutation.mutate(
        { name: name.trim(), category: category.trim() },
        {
          onSuccess: () => {
            toast({ description: "Equipo creado correctamente" });
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
            if (nameError) setNameError("");
          }}
          placeholder="Ej. U14 Azul"
          disabled={isPending}
        />
        {nameError && (
          <p className="font-body text-[0.75rem] text-error-container">
            {nameError}
          </p>
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
          {isEditMode ? "Guardar cambios" : "Crear equipo"}
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

// Top glow gradient signature for the dialog container
function TopGlow() {
  return (
    <div
      className="h-0.5 w-full rounded-t-3xl"
      style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
    />
  );
}

export default function TeamFormSheet({
  open,
  onOpenChange,
  team,
}: TeamFormSheetProps) {
  const isEditMode = team !== null;
  const isDesktop = useIsDesktop();
  const title = isEditMode ? "Editar equipo" : "Crear equipo";
  const formKey = open ? (team?.id ?? "new") : "closed";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-120 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <TopGlow />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-[1.25rem] font-semibold text-on-surface">
              {title}
            </DialogTitle>
          </DialogHeader>
          {/* key forces remount when dialog opens/closes, resetting form state */}
          <FormBody key={formKey} team={team} onOpenChange={onOpenChange} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-high border-0 rounded-t-3xl max-h-[90vh] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="font-display text-[1.25rem] font-semibold text-on-surface">
            {title}
          </SheetTitle>
        </SheetHeader>
        {/* key forces remount when sheet opens/closes, resetting form state */}
        <FormBody key={formKey} team={team} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
