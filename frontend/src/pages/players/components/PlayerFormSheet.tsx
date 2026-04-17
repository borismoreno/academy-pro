import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { DateSelector } from "@/components/shared/DateSelector";
import { toast } from "@/hooks/use-toast";
import { useTeams } from "@/hooks/useTeams";
import { createPlayer, updatePlayer } from "@/services/players.service";
import type {
  PlayerResponse,
  CreatePlayerData,
  UpdatePlayerData,
} from "@/services/players.service";

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message)
      return axiosError.response.data.message;
  }
  return "Ha ocurrido un error inesperado";
}

const POSITIONS = ["Portero", "Defensa", "Mediocampista", "Delantero"];

const SELECT_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary min-h-11 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

interface PlayerFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: PlayerResponse | null;
}

interface FormBodyProps {
  player: PlayerResponse | null;
  onOpenChange: (open: boolean) => void;
}

function FormBody({ player, onOpenChange }: FormBodyProps) {
  const isEditMode = player !== null;
  const queryClient = useQueryClient();
  const { teams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  // Normalize ISO date string to YYYY-MM-DD for the date input
  const initialBirthDate = player?.birthDate
    ? player.birthDate.substring(0, 10)
    : "";

  const [fullName, setFullName] = useState(player?.fullName ?? "");
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [position, setPosition] = useState(player?.position ?? "Portero");
  const [teamId, setTeamId] = useState(player?.teamId ?? "");
  const [isActive, setIsActive] = useState(player?.isActive ?? true);

  const [fullNameError, setFullNameError] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [teamIdError, setTeamIdError] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: CreatePlayerData) => createPlayer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlayerData }) =>
      updatePlayer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["player", player?.id] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function validate(): boolean {
    let valid = true;
    if (fullName.trim().length < 2) {
      setFullNameError("El nombre debe tener al menos 2 caracteres");
      valid = false;
    } else {
      setFullNameError("");
    }
    if (!birthDate) {
      setBirthDateError("La fecha de nacimiento es obligatoria");
      valid = false;
    } else {
      setBirthDateError("");
    }
    if (!teamId) {
      setTeamIdError("Selecciona un equipo");
      valid = false;
    } else {
      setTeamIdError("");
    }
    return valid;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      fullName: fullName.trim(),
      birthDate,
      position,
      teamId,
      isActive,
    };

    if (isEditMode && player) {
      updateMutation.mutate(
        { id: player.id, data },
        {
          onSuccess: () => {
            toast({ description: "Jugador actualizado correctamente" });
            onOpenChange(false);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast({ description: "Jugador agregado correctamente" });
          onOpenChange(false);
        },
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Nombre completo
        </label>
        <Input
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (fullNameError) setFullNameError("");
          }}
          placeholder="Ej. Carlos Andrade"
          disabled={isPending}
        />
        {fullNameError && (
          <p className="font-body text-xs text-error-container">
            {fullNameError}
          </p>
        )}
      </div>

      {/* Birth date */}
      <div className="flex flex-col gap-1">
        <DateSelector
          label="Fecha de nacimiento"
          value={birthDate}
          onChange={(val) => {
            setBirthDate(val);
            if (birthDateError) setBirthDateError("");
          }}
          yearRange={{
            min: new Date().getFullYear() - 80,
            max: new Date().getFullYear() - 5,
          }}
        />
        {birthDateError && (
          <p className="font-body text-xs text-error-container mt-1">
            {birthDateError}
          </p>
        )}
      </div>

      {/* Position */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Posición
        </label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          disabled={isPending}
          className={SELECT_CLASS}
        >
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {/* Team */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Equipo
        </label>
        <select
          value={teamId}
          onChange={(e) => {
            setTeamId(e.target.value);
            if (teamIdError) setTeamIdError("");
          }}
          disabled={isPending}
          className={SELECT_CLASS}
        >
          <option value="">Seleccionar equipo</option>
          {activeTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        {teamIdError && (
          <p className="font-body text-xs text-error-container">
            {teamIdError}
          </p>
        )}
      </div>

      {/* Active */}
      {isEditMode && (
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm text-on-surface-variant">
            Activo
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
              isActive ? "bg-primary" : "bg-surface-highest"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-on-primary transition-transform ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? <LoadingSpinner size="sm" /> : null}
          {isEditMode ? "Guardar cambios" : "Agregar jugador"}
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
      className="h-0.5 w-full"
      style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
    />
  );
}

export default function PlayerFormSheet({
  open,
  onOpenChange,
  player,
}: PlayerFormSheetProps) {
  const isEditMode = player !== null;
  const isDesktop = useIsDesktop();
  const title = isEditMode ? "Editar jugador" : "Agregar jugador";
  const formKey = open ? (player?.id ?? "new") : "closed";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-130 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <TopGlow />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              {title}
            </DialogTitle>
          </DialogHeader>
          <FormBody key={formKey} player={player} onOpenChange={onOpenChange} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-high border-0 rounded-t-3xl max-h-[90vh] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="font-display text-xl font-semibold text-on-surface">
            {title}
          </SheetTitle>
        </SheetHeader>
        <FormBody key={formKey} player={player} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
