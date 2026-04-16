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
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { toast } from "@/hooks/use-toast";
import { usePlayerDetail } from "@/hooks/usePlayerDetail";
import api from "@/services/api";
import type { ApiResponse } from "@/types";

interface AcademyMember {
  userId: string;
  fullName: string;
  email: string;
  isActive: boolean;
  role: string;
}

async function fetchParents(): Promise<AcademyMember[]> {
  const response = await api.get<ApiResponse<AcademyMember[]>>(
    "/academies/members?role=parent",
  );
  return response.data.data;
}

const RELATIONSHIP_OPTIONS = ["Padre", "Madre", "Tutor"];

interface FormBodyProps {
  playerId: string;
  onOpenChange: (open: boolean) => void;
}

function FormBody({ playerId, onOpenChange }: FormBodyProps) {
  const { addParentMutation } = usePlayerDetail(playerId);

  const { data: parents = [], isLoading: isLoadingParents } = useQuery({
    queryKey: ["academy-parents"],
    queryFn: fetchParents,
  });

  const [selectedUserId, setSelectedUserId] = useState("");
  const [relationship, setRelationship] = useState("Padre");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;

    addParentMutation.mutate(
      { userId: selectedUserId, relationship },
      {
        onSuccess: () => {
          toast({ description: "Padre/tutor vinculado correctamente" });
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Parent selector */}
      <SearchableSelect
        options={parents.map((p) => ({
          value: p.userId,
          label: p.fullName,
          subtitle: p.email,
        }))}
        value={selectedUserId}
        onValueChange={setSelectedUserId}
        placeholder="Seleccionar padre/tutor"
        searchPlaceholder="Buscar por nombre o email..."
        isLoading={isLoadingParents}
        disabled={addParentMutation.isPending}
      />

      {/* Relationship select */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Relación con el jugador
        </label>
        <select
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          disabled={addParentMutation.isPending}
          className="w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary min-h-11 appearance-none cursor-pointer"
        >
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={addParentMutation.isPending || !selectedUserId}
        >
          {addParentMutation.isPending ? <LoadingSpinner size="sm" /> : null}
          Vincular
        </Button>
        <Button
          type="button"
          variant="tertiary"
          className="w-full"
          onClick={() => onOpenChange(false)}
          disabled={addParentMutation.isPending}
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

interface AddParentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string;
}

export default function AddParentSheet({
  open,
  onOpenChange,
  playerId,
}: AddParentSheetProps) {
  const isDesktop = useIsDesktop();
  const formKey = open ? playerId : "closed";

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-120 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <TopGlow />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              Vincular padre/tutor
            </DialogTitle>
          </DialogHeader>
          <FormBody
            key={formKey}
            playerId={playerId}
            onOpenChange={onOpenChange}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-high border-0 rounded-t-3xl max-h-[90vh] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="font-display text-xl font-semibold text-on-surface">
            Vincular padre/tutor
          </SheetTitle>
        </SheetHeader>
        <FormBody
          key={formKey}
          playerId={playerId}
          onOpenChange={onOpenChange}
        />
      </SheetContent>
    </Sheet>
  );
}
