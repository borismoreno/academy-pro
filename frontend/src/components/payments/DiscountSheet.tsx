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
import type { PaymentRecord, DiscountType } from "@/types/payment.types";

const INPUT_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50";

const SELECT_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer";

const TEXTAREA_CLASS =
  "w-full bg-surface-low border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary resize-none placeholder:text-on-surface-variant/50";

const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  siblings: "Hermanos",
  scholarship: "Beca",
  other: "Otro",
};

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

  const baseAmount = Number(record.baseAmount);

  const [discountAmount, setDiscountAmount] = useState(
    String(Number(record.discountAmount) || ""),
  );
  const [discountType, setDiscountType] = useState<DiscountType>(
    record.discountType ?? "other",
  );
  const [discountNotes, setDiscountNotes] = useState(
    record.discountNotes ?? "",
  );
  const [amountError, setAmountError] = useState("");

  const parsedDiscount = parseFloat(discountAmount) || 0;
  const finalAmount = Math.max(0, baseAmount - parsedDiscount);

  function validate(): boolean {
    if (parsedDiscount < 0) {
      setAmountError("El descuento no puede ser negativo");
      return false;
    }
    if (parsedDiscount > baseAmount) {
      setAmountError(`El descuento no puede superar ${formatCurrency(baseAmount)}`);
      return false;
    }
    setAmountError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await updateRecord.mutateAsync(
      {
        recordId: record.id,
        data: {
          discountAmount: parsedDiscount,
          discountType,
          ...(discountNotes.trim() ? { discountNotes: discountNotes.trim() } : { discountNotes: "" }),
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
        <p className="font-body text-sm text-on-surface-variant mt-1">
          Monto base: {formatCurrency(baseAmount)}
        </p>
      </div>

      {/* Discount amount */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Monto de descuento
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-sm text-on-surface-variant pointer-events-none">
            $
          </span>
          <input
            type="number"
            min="0"
            max={baseAmount}
            step="0.01"
            value={discountAmount}
            onChange={(e) => {
              setDiscountAmount(e.target.value);
              if (amountError) setAmountError("");
            }}
            placeholder="0.00"
            className={`${INPUT_CLASS} pl-8`}
            disabled={updateRecord.isPending}
          />
        </div>
        {amountError && (
          <p className="font-body text-xs text-error-container">{amountError}</p>
        )}
      </div>

      {/* Discount type */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Tipo de descuento
        </label>
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value as DiscountType)}
          className={SELECT_CLASS}
          disabled={updateRecord.isPending}
        >
          {(Object.keys(DISCOUNT_TYPE_LABELS) as DiscountType[]).map((key) => (
            <option key={key} value={key} className="bg-surface-high">
              {DISCOUNT_TYPE_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Notas del descuento (opcional)
        </label>
        <textarea
          value={discountNotes}
          onChange={(e) => setDiscountNotes(e.target.value)}
          placeholder="Ej: Hermano mayor ya inscrito"
          rows={3}
          disabled={updateRecord.isPending}
          className={TEXTAREA_CLASS}
        />
      </div>

      {/* Final amount preview */}
      <div className="bg-surface-highest rounded-xl p-4 flex items-center justify-between">
        <span className="font-body text-sm text-on-surface-variant">
          Monto final
        </span>
        <span className="font-display text-xl font-bold text-primary">
          {formatCurrency(finalAmount)}
        </span>
      </div>

      <button
        type="submit"
        disabled={updateRecord.isPending}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer sticky bottom-0"
      >
        {updateRecord.isPending ? <LoadingSpinner size="sm" /> : null}
        Aplicar descuento
      </button>
    </form>
  );
}

interface DiscountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: PaymentRecord | null;
  conceptId: string;
}

export default function DiscountSheet({
  open,
  onOpenChange,
  record,
  conceptId,
}: DiscountSheetProps) {
  const isDesktop = useIsDesktop();

  if (!record) return null;

  const title = "Aplicar descuento";
  const content = (
    <FormContent
      key={record.id + String(open)}
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
