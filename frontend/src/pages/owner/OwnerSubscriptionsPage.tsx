import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import SubscriptionFormDialog from "./components/SubscriptionFormDialog";
import { useOwnerAcademies } from "@/hooks/useOwner";
import type { AcademyWithSubscription } from "@/types";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PLAN_CHIP_CLASSES: Record<string, string> = {
  free: "bg-surface-highest text-on-surface-variant",
  pro: "bg-primary-container text-on-primary",
  enterprise: "bg-secondary text-surface-lowest",
};

const STATUS_CHIP_CLASSES: Record<string, string> = {
  active: "bg-primary-container text-on-primary",
  suspended: "bg-error-container text-on-surface",
  cancelled: "bg-surface-highest text-on-surface-variant",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  suspended: "Suspendida",
  cancelled: "Cancelada",
};

type AcademyRow = Record<string, unknown> & AcademyWithSubscription;

function planChip(plan: string) {
  return (
    <span
      className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${PLAN_CHIP_CLASSES[plan] ?? "bg-surface-highest text-on-surface-variant"}`}
    >
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

function statusChip(status: string) {
  return (
    <span
      className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${STATUS_CHIP_CLASSES[status] ?? ""}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function OwnerSubscriptionsPage() {
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAcademy, setSelectedAcademy] =
    useState<AcademyWithSubscription | null>(null);

  const { data: allAcademies = [], isLoading } = useOwnerAcademies();

  const academies = allAcademies.filter((a) => {
    const plan = a.subscription?.plan ?? "free";
    const status = a.subscription?.status ?? "active";
    if (planFilter !== "all" && plan !== planFilter) return false;
    if (statusFilter !== "all" && status !== statusFilter) return false;
    return true;
  });

  function getDaysRemaining(endsAt: string | null | undefined): number | null {
    if (!endsAt) return null;
    const diff = new Date(endsAt).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  const columns = [
    {
      key: "name",
      label: "Academia",
      render: (row: AcademyRow) => (
        <span className="font-medium text-on-surface">{row.name}</span>
      ),
    },
    {
      key: "plan",
      label: "Plan",
      render: (row: AcademyRow) => planChip(row.subscription?.plan ?? "free"),
    },
    {
      key: "status",
      label: "Estado",
      render: (row: AcademyRow) =>
        statusChip(row.subscription?.status ?? "active"),
    },
    {
      key: "startsAt",
      label: "Inicio",
      render: (row: AcademyRow) =>
        row.subscription?.startsAt
          ? new Date(row.subscription.startsAt).toLocaleDateString("es-EC")
          : "—",
    },
    {
      key: "endsAt",
      label: "Vencimiento",
      render: (row: AcademyRow) =>
        row.subscription?.endsAt
          ? new Date(row.subscription.endsAt).toLocaleDateString("es-EC")
          : "—",
    },
    {
      key: "daysRemaining",
      label: "Días restantes",
      render: (row: AcademyRow) => {
        const days = getDaysRemaining(row.subscription?.endsAt);
        if (days === null)
          return <span className="text-on-surface-variant">—</span>;
        return (
          <span
            className={
              days < 30
                ? "font-medium text-error-container"
                : "text-on-surface"
            }
          >
            {days}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Acción",
      render: (row: AcademyRow) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAcademy(row as AcademyWithSubscription);
          }}
          className="font-body text-sm text-primary hover:underline min-h-11 flex items-center"
        >
          Editar
        </button>
      ),
    },
  ];

  const selectClass =
    "h-10 rounded-xl border border-outline-variant/15 bg-surface-low px-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <PageHeader title="Suscripciones" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">Todos los planes</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="suspended">Suspendida</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]["columns"]}
        data={academies as AcademyRow[]}
        isLoading={isLoading}
        emptyMessage="No hay suscripciones que coincidan con los filtros."
        mobileCard={(row) => {
          const item = row as AcademyRow;
          const plan = item.subscription?.plan ?? "free";
          const status = item.subscription?.status ?? "active";
          const days = getDaysRemaining(item.subscription?.endsAt);
          return (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="font-display text-[1.1rem] font-semibold text-on-surface">
                  {String(item.name)}
                </p>
                {planChip(plan)}
              </div>
              <div className="flex items-center gap-2">
                {statusChip(status)}
                <p className="text-sm text-on-surface-variant">
                  Vence:{" "}
                  {item.subscription?.endsAt
                    ? new Date(item.subscription.endsAt).toLocaleDateString(
                        "es-EC",
                      )
                    : "—"}
                </p>
              </div>
              <p
                className={`text-sm font-medium ${days !== null && days < 30 ? "text-error-container" : "text-on-surface-variant"}`}
              >
                {days !== null ? `${days} días restantes` : "Sin vencimiento"}
              </p>
              <button
                onClick={() =>
                  setSelectedAcademy(item as AcademyWithSubscription)
                }
                className="self-start text-sm text-primary font-medium min-h-[44px] flex items-center"
              >
                Editar suscripción →
              </button>
            </div>
          );
        }}
      />

      <SubscriptionFormDialog
        open={!!selectedAcademy}
        onClose={() => setSelectedAcademy(null)}
        academy={selectedAcademy}
      />
    </div>
  );
}
