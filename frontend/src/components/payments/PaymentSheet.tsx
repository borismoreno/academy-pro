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
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useUpdateRecord } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/utils";
import type { PaymentRecord } from "@/types/payment.types";

const SELECT_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer";

const TEXTAREA_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary resize-none placeholder:text-on-surface-variant/50";

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
  record: PaymentRecord;
  conceptId: string;
  onSuccess: () => void;
}

function FormContent({ record, conceptId, onSuccess }: FormContentProps) {
  const updateRecord = useUpdateRecord(conceptId);
  const [paymentMethod, setPaymentMethod] = useState("Transferencia");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateRecord.mutateAsync(
      {
        recordId: record.id,
        data: {
          status: "paid",
          paidAt: new Date().toISOString(),
          paymentMethod,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      },
      { onSuccess },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Player info */}
      <div className="bg-surface-highest rounded-xl p-4">
        <p className="font-body text-sm text-on-surface-variant mb-1">
          Jugador
        </p>
        <p className="font-display text-lg font-semibold text-on-surface">
          {record.player.fullName}
        </p>
        <p className="font-body text-sm text-primary mt-1">
          Monto a cobrar: {formatCurrency(Number(record.finalAmount))}
        </p>
      </div>

      {/* Payment method */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Método de pago
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className={SELECT_CLASS}
          disabled={updateRecord.isPending}
        >
          <option value="Transferencia" className="bg-surface-high">
            Transferencia
          </option>
          <option value="Efectivo" className="bg-surface-high">
            Efectivo
          </option>
          <option value="Otro" className="bg-surface-high">
            Otro
          </option>
        </select>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones del pago..."
          rows={3}
          disabled={updateRecord.isPending}
          className={TEXTAREA_CLASS}
        />
      </div>

      <button
        type="submit"
        disabled={updateRecord.isPending}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer sticky bottom-0"
      >
        {updateRecord.isPending ? <LoadingSpinner size="sm" /> : null}
        Confirmar pago
      </button>
    </form>
  );
}

interface PaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: PaymentRecord | null;
  conceptId: string;
}

export default function PaymentSheet({
  open,
  onOpenChange,
  record,
  conceptId,
}: PaymentSheetProps) {
  const isDesktop = useIsDesktop();

  if (!record) return null;

  const title = "Registrar pago";
  const content = (
    <FormContent
      key={record.id}
      record={record}
      conceptId={conceptId}
      onSuccess={() => onOpenChange(false)}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-md p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
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
