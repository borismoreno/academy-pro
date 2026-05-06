import { Wallet } from "lucide-react";
import type { PortalPaymentRecord } from "@/types/payment.types";
import type { PaymentStatus } from "@/types/payment.types";
import { formatCurrency } from "@/lib/utils";

interface PortalPaymentStatusProps {
  records: PortalPaymentRecord[] | undefined;
  isLoading: boolean;
}

const STATUS_ORDER: Record<PaymentStatus, number> = {
  overdue: 0,
  pending: 1,
  paid: 2,
};

function sortRecords(records: PortalPaymentRecord[]): PortalPaymentRecord[] {
  return [...records].sort((a, b) => {
    const orderDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (orderDiff !== 0) return orderDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function statusBadge(status: PaymentStatus): { label: string; className: string } {
  if (status === "paid")
    return { label: "Pagado", className: "bg-primary-container text-on-primary" };
  if (status === "overdue")
    return { label: "Vencido", className: "bg-error-container text-white" };
  return { label: "Pendiente", className: "bg-yellow-900/40 text-yellow-400" };
}

function SkeletonCard() {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-surface-highest rounded" />
          <div className="h-5 w-20 bg-surface-highest rounded-full" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface-highest rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function PortalPaymentStatus({
  records,
  isLoading,
}: PortalPaymentStatusProps) {
  if (isLoading) return <SkeletonCard />;

  const sorted = sortRecords(records ?? []);
  const overdueCount = sorted.filter((r) => r.status === "overdue").length;
  const pendingCount = sorted.filter((r) => r.status === "pending").length;
  const alertCount = overdueCount + pendingCount;

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-primary" />
            <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
              Estado de Pagos
            </h3>
          </div>
          {alertCount > 0 && (
            <span className="shrink-0 font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-2.5 py-1 bg-error-container text-white">
              {alertCount} pendiente{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Empty state */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <Wallet size={36} className="text-on-surface-variant" />
            <p className="font-body text-sm text-on-surface-variant">
              Sin cuotas registradas
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((record) => {
              const badge = statusBadge(record.status);
              const hasDiscount = record.discountAmount > 0;

              return (
                <div
                  key={record.id}
                  className="bg-surface-highest rounded-2xl p-4 flex flex-col gap-2"
                >
                  {/* Concept name + status badge */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display font-semibold text-[0.9375rem] text-on-surface leading-tight">
                      {record.concept.name}
                    </p>
                    <span
                      className={[
                        "shrink-0 font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-2.5 py-0.5",
                        badge.className,
                      ].join(" ")}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Due date + amounts */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-body text-[0.75rem] text-on-surface-variant">
                      Vence:{" "}
                      {new Date(record.concept.dueDate).toLocaleDateString(
                        "es-EC",
                        { timeZone: "UTC" },
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      {hasDiscount && (
                        <span className="font-body text-[0.75rem] text-on-surface-variant line-through">
                          {formatCurrency(record.baseAmount)}
                        </span>
                      )}
                      <span
                        className={[
                          "font-body text-sm font-medium",
                          hasDiscount ? "text-primary" : "text-on-surface",
                        ].join(" ")}
                      >
                        {formatCurrency(record.finalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Paid-at info */}
                  {record.status === "paid" && record.paidAt && (
                    <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                      Pagado el{" "}
                      {new Date(record.paidAt).toLocaleDateString("es-EC")}
                      {record.paymentMethod
                        ? ` · ${record.paymentMethod}`
                        : ""}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
