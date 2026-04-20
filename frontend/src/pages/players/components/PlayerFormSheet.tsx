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
import { SearchableSelect } from "@/components/shared/SearchableSelect";

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message)
      return axiosError.response.data.message;
  }
  return "Ha ocurrido un error inesperado";
}

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
  const { teams, isLoading: isLoadingTeams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  // Normalize ISO date string to YYYY-MM-DD for the date input
  const initialBirthDate = player?.birthDate
    ? player.birthDate.substring(0, 10)
    : "";

  const [fullName, setFullName] = useState(player?.fullName ?? "");
  const [birthDate, setBirthDate] = useState(initialBirthDate);
  const [position, setPosition] = useState(player?.position ?? "");
  const [height, setHeight] = useState(String(player?.height ?? ""));
  const [weight, setWeight] = useState(String(player?.weight ?? ""));

  const [teamId, setTeamId] = useState(player?.teamId ?? "");
  const [isActive, setIsActive] = useState(player?.isActive ?? true);

  const [fullNameError, setFullNameError] = useState("");
  const [positionError, setPositionError] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [teamIdError, setTeamIdError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");

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
    if (position.trim().length < 2) {
      setPositionError("La posición debe tener al menos 2 caracteres");
      valid = false;
    } else {
      setPositionError("");
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
    if (height) {
      const heightValue = parseInt(height, 10);
      if (isNaN(heightValue) || heightValue <= 50) {
        setHeightError("La altura debe ser un número positivo mayor a 50 cm");
        valid = false;
      } else {
        setHeightError("");
      }
    } else {
      setHeightError("");
    }
    if (weight) {
      const weightValue = parseInt(weight, 10);
      if (isNaN(weightValue) || weightValue <= 10) {
        setWeightError("El peso debe ser un número positivo mayor a 10 kg");
        valid = false;
      } else {
        setWeightError("");
      }
    } else {
      setWeightError("");
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
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      teamId,
      ...(isEditMode && { isActive }),
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
        <Input
          value={position}
          onChange={(e) => {
            setPosition(e.target.value);
            if (positionError) setPositionError("");
          }}
          placeholder="Ej. Portero"
          disabled={isPending}
        />
        {positionError && (
          <p className="font-body text-xs text-error-container">
            {positionError}
          </p>
        )}
      </div>

      {/* Height */}
      <div className="flex gap-1.5">
        <div className="flex flex-col flex-1">
          <label className="font-body text-sm text-on-surface-variant">
            Altura (cm)
          </label>
          <Input
            value={height}
            onChange={(e) => {
              setHeight(e.target.value);
              if (heightError) setHeightError("");
            }}
            step="0.01"
            placeholder="Ej. 180"
            disabled={isPending}
          />
          {heightError && (
            <p className="font-body text-xs text-error-container">
              {heightError}
            </p>
          )}
        </div>
        {/* Weight */}
        <div className="flex flex-col flex-1">
          <label className="font-body text-sm text-on-surface-variant">
            Peso (kg)
          </label>
          <Input
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value);
              if (weightError) setWeightError("");
            }}
            step="0.01"
            placeholder="Ej. 75"
            disabled={isPending}
          />
          {weightError && (
            <p className="font-body text-xs text-error-container">
              {weightError}
            </p>
          )}
        </div>
      </div>

      {/* Team */}
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
            if (teamIdError) setTeamIdError("");
          }}
          placeholder="Seleccionar equipo"
          searchPlaceholder="Buscar equipo..."
          isLoading={isLoadingTeams}
          disabled={createMutation.isPending}
        />
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
