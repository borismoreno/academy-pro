import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { toast } from "@/hooks/use-toast";
import { useTeamDetail } from "@/hooks/useTeamDetail";
import api from "@/services/api";
import type { ApiResponse } from "@/types";

interface AcademyMember {
  userId: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: string;
}

async function fetchCoaches(): Promise<AcademyMember[]> {
  const response = await api.get<ApiResponse<AcademyMember[]>>(
    "/academies/members?role=coach",
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

function FormBody({ teamId, onOpenChange }: FormBodyProps) {
  const { addCoachMutation } = useTeamDetail(teamId);
  const navigate = useNavigate();

  const { data: coaches = [], isLoading: isLoadingCoaches } = useQuery({
    queryKey: ["academy-coaches"],
    queryFn: fetchCoaches,
  });

  const [selectedUserId, setSelectedUserId] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;

    addCoachMutation.mutate(
      { userId: selectedUserId, isPrimary },
      {
        onSuccess: () => {
          toast({ description: "Entrenador agregado correctamente" });
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Coach selector */}
      <SearchableSelect
        options={coaches.map((c) => ({
          value: c.userId,
          label: c.fullName,
          subtitle: c.email,
        }))}
        value={selectedUserId}
        onValueChange={setSelectedUserId}
        placeholder="Seleccionar entrenador"
        searchPlaceholder="Buscar entrenador..."
        isLoading={isLoadingCoaches}
        disabled={addCoachMutation.isPending}
        emptyAction={
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate("/settings?action=invite");
            }}
            className="font-body text-sm text-primary hover:underline"
          >
            Invitar entrenador desde Configuración →
          </button>
        }
      />

      {/* isPrimary toggle */}
      <div className="flex items-center justify-between min-h-11">
        <span className="font-body text-sm text-on-surface-variant">
          Entrenador principal
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isPrimary}
          onClick={() => setIsPrimary((prev) => !prev)}
          disabled={addCoachMutation.isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            isPrimary ? "bg-primary" : "bg-surface-highest"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-on-primary transition-transform ${
              isPrimary ? "translate-x-6" : "translate-x-1"
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

export default function AddCoachSheet({
  open,
  onOpenChange,
  teamId,
}: AddCoachSheetProps) {
  const isDesktop = useIsDesktop();
  const formKey = open ? teamId : "closed";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-120 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <TopGlow />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              Agregar entrenador
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
            Agregar entrenador
          </SheetTitle>
        </SheetHeader>
        <FormBody key={formKey} teamId={teamId} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}
