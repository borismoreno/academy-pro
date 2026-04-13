import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useUpdateSubscription } from "@/hooks/useOwner";
import { toast } from "@/hooks/use-toast";
import type { AcademyWithSubscription } from "@/types";

interface SubscriptionFormDialogProps {
  open: boolean;
  onClose: () => void;
  academy: AcademyWithSubscription | null;
}

export default function SubscriptionFormDialog({
  open,
  onClose,
  academy,
}: SubscriptionFormDialogProps) {
  const [plan, setPlan] = useState<"free" | "pro" | "enterprise">("free");
  const [status, setStatus] = useState<"active" | "suspended" | "cancelled">("active");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [dateError, setDateError] = useState("");

  const updateSubscription = useUpdateSubscription(academy?.id ?? "");

  useEffect(() => {
    if (academy?.subscription) {
      setPlan(academy.subscription.plan);
      setStatus(academy.subscription.status);
      setStartsAt(academy.subscription.startsAt.split("T")[0]);
      setEndsAt(academy.subscription.endsAt?.split("T")[0] ?? "");
    } else {
      setPlan("free");
      setStatus("active");
      setStartsAt(new Date().toISOString().split("T")[0]);
      setEndsAt("");
    }
    setDateError("");
  }, [academy, open]);

  function handleClose() {
    setDateError("");
    onClose();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDateError("");

    if (startsAt && endsAt && endsAt <= startsAt) {
      setDateError("La fecha de vencimiento debe ser posterior a la fecha de inicio.");
      return;
    }

    updateSubscription.mutate(
      {
        plan,
        status,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Suscripción actualizada",
            description: "Suscripción actualizada correctamente.",
          });
          handleClose();
        },
      },
    );
  }

  const selectClass =
    "flex h-10 w-full rounded-xl border border-outline-variant/15 bg-surface-low px-3 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-110 bg-surface-high border-outline-variant/15 rounded-3xl p-0 overflow-hidden shadow-[0px_24px_48px_rgba(0,0,0,0.5)]">
        {/* Top glow */}
        <div
          className="h-0.5 w-full"
          style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
        />

        <div className="px-8 py-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-[1.75rem] font-semibold text-on-surface">
              Editar suscripción
            </DialogTitle>
            {academy && (
              <p className="font-body text-sm text-on-surface-variant mt-1">
                {academy.name}
              </p>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Plan */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Plan
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as typeof plan)}
                className={selectClass}
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className={selectClass}
              >
                <option value="active">Activa</option>
                <option value="suspended">Suspendida</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            {/* Starts at */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Fecha de inicio
              </label>
              <Input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>

            {/* Ends at */}
            <div className="flex flex-col gap-2">
              <label className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                Fecha de vencimiento
              </label>
              <Input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
              {dateError && (
                <p className="font-body text-xs text-error-container">
                  {dateError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={updateSubscription.isPending}
            >
              {updateSubscription.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Guardar suscripción"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
