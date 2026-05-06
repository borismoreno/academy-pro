import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, DollarSign } from "lucide-react";
import DataTable from "@/components/shared/DataTable";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import PaymentSheet from "@/components/payments/PaymentSheet";
import DiscountSheet from "@/components/payments/DiscountSheet";
import { useGetConcept } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/utils";
import type { PaymentRecord, PaymentStatus } from "@/types/payment.types";

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-body text-xs font-medium bg-primary-container text-on-primary">
        Pagado
      </span>
    );
  }
  if (status === "overdue") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-body text-xs font-medium bg-error-container text-white">
        Vencido
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-body text-xs font-medium bg-yellow-900/40 text-yellow-400">
      Pendiente
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-EC");
}

type RecordRow = PaymentRecord & Record<string, unknown>;

export default function ConceptDetailPage() {
  const { id: conceptId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);
  const [discountRecord, setDiscountRecord] = useState<PaymentRecord | null>(null);

  const { data: concept, isLoading, isError } = useGetConcept(conceptId ?? "");

  const columns = [
    {
      key: "playerName",
      label: "Jugador",
      render: (row: Record<string, unknown>) => {
        const r = row as RecordRow;
        return (
          <span className="font-body text-sm text-on-surface">
            {r.player.fullName}
          </span>
        );
      },
    },
    {
      key: "baseAmount",
      label: "Monto base",
      render: (row: Record<string, unknown>) =>
        formatCurrency(Number((row as RecordRow).baseAmount)),
    },
    {
      key: "discountAmount",
      label: "Descuento",
      render: (row: Record<string, unknown>) => {
        const amt = Number((row as RecordRow).discountAmount);
        return amt > 0 ? `- ${formatCurrency(amt)}` : "—";
      },
    },
    {
      key: "finalAmount",
      label: "Monto final",
      render: (row: Record<string, unknown>) =>
        formatCurrency(Number((row as RecordRow).finalAmount)),
    },
    {
      key: "status",
      label: "Estado",
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={(row as RecordRow).status} />
      ),
    },
    {
      key: "paidAt",
      label: "Fecha de pago",
      render: (row: Record<string, unknown>) => {
        const paidAt = (row as RecordRow).paidAt;
        return paidAt ? formatDate(paidAt) : "—";
      },
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row: Record<string, unknown>) => {
        const r = row as RecordRow;
        return (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {r.status !== "paid" && (
              <button
                onClick={() => setPaymentRecord(r)}
                className="h-8 px-3 rounded-lg font-body text-xs font-medium bg-linear-to-br from-primary to-secondary text-on-primary hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
              >
                Registrar pago
              </button>
            )}
            <button
              onClick={() => setDiscountRecord(r)}
              className="h-8 px-3 rounded-lg font-body text-xs font-medium bg-surface-highest text-primary hover:opacity-80 transition-opacity cursor-pointer"
            >
              Descuento
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !concept) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/payments")}
          className="flex items-center gap-2 font-body text-sm text-on-surface-variant hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Volver a Pagos
        </button>
        <EmptyState message="No se encontró el concepto de pago." />
      </div>
    );
  }

  const records = concept.records ?? [];
  const tableData = records as unknown as Record<string, unknown>[];

  return (
    <div className="flex flex-col gap-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/payments")}
        className="flex items-center gap-2 font-body text-sm text-on-surface-variant hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Volver a Pagos
      </button>

      {/* Header */}
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
        <div className="p-6 flex flex-col gap-4">
          <h2 className="font-display text-[1.75rem] font-semibold text-on-surface leading-tight">
            {concept.name}
          </h2>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-3">
            {concept.team && (
              <div className="flex items-center gap-1.5 bg-surface-highest rounded-xl px-3 py-2">
                <Users size={14} className="text-on-surface-variant" />
                <span className="font-body text-sm text-on-surface-variant">
                  {concept.team.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-surface-highest rounded-xl px-3 py-2">
              <DollarSign size={14} className="text-on-surface-variant" />
              <span className="font-body text-sm text-on-surface-variant">
                {formatCurrency(Number(concept.amount))}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-highest rounded-xl px-3 py-2">
              <Calendar size={14} className="text-on-surface-variant" />
              <span className="font-body text-sm text-on-surface-variant">
                Vence {formatDate(concept.dueDate)}
              </span>
            </div>
          </div>

          {/* Mini summary */}
          <div className="flex gap-6 font-body text-sm">
            <span className="text-primary font-medium">
              {concept.totalPaid} pagados
            </span>
            <span className="text-yellow-400 font-medium">
              {concept.totalPending} pendientes
            </span>
            {concept.totalOverdue > 0 && (
              <span className="text-error-container font-medium">
                {concept.totalOverdue} vencidos
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Records table */}
      <DataTable
        columns={columns}
        data={tableData}
        isLoading={false}
        emptyMessage="No hay registros de pago para este concepto."
        mobileCard={(row) => {
          const r = row as RecordRow;
          return (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-base font-semibold text-on-surface">
                    {r.player.fullName}
                  </p>
                  {r.player.teamName && (
                    <p className="font-body text-xs text-on-surface-variant mt-0.5">
                      {r.player.teamName}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-display text-base font-bold text-primary">
                    {formatCurrency(Number(r.finalAmount))}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
              {Number(r.discountAmount) > 0 && (
                <p className="font-body text-xs text-on-surface-variant">
                  Descuento: {formatCurrency(Number(r.discountAmount))}
                  {r.discountNotes ? ` — ${r.discountNotes}` : ""}
                </p>
              )}
              {r.paidAt && (
                <p className="font-body text-xs text-on-surface-variant">
                  Pagado el {formatDate(r.paidAt)}
                  {r.paymentMethod ? ` · ${r.paymentMethod}` : ""}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                {r.status !== "paid" && (
                  <button
                    onClick={() => setPaymentRecord(r)}
                    className="flex-1 h-9 rounded-xl font-body text-xs font-semibold bg-linear-to-br from-primary to-secondary text-on-primary hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Registrar pago
                  </button>
                )}
                <button
                  onClick={() => setDiscountRecord(r)}
                  className="h-9 px-4 rounded-xl font-body text-xs font-medium bg-surface-highest text-primary hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Descuento
                </button>
              </div>
            </div>
          );
        }}
      />

      {/* Payment sheet */}
      <PaymentSheet
        open={!!paymentRecord}
        onOpenChange={(open) => {
          if (!open) setPaymentRecord(null);
        }}
        record={paymentRecord}
        conceptId={conceptId ?? ""}
      />

      {/* Discount sheet */}
      <DiscountSheet
        open={!!discountRecord}
        onOpenChange={(open) => {
          if (!open) setDiscountRecord(null);
        }}
        record={discountRecord}
        conceptId={conceptId ?? ""}
      />
    </div>
  );
}
