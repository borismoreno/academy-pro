import { useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import DataTable from "@/components/shared/DataTable";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useOwnerStats, useOwnerAcademies } from "@/hooks/useOwner";
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

function PlanChip({ plan }: { plan: string }) {
  return (
    <span
      className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${PLAN_CHIP_CLASSES[plan] ?? "bg-surface-highest text-on-surface-variant"}`}
    >
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

type AcademyRow = Record<string, unknown> & AcademyWithSubscription;

const recentColumns = [
  {
    key: "name",
    label: "Nombre",
    render: (row: AcademyRow) => (
      <span className="font-medium text-on-surface">{row.name}</span>
    ),
  },
  {
    key: "plan",
    label: "Plan",
    render: (row: AcademyRow) => (
      <PlanChip plan={row.subscription?.plan ?? "free"} />
    ),
  },
  {
    key: "status",
    label: "Estado",
    render: (row: AcademyRow) => {
      const s = row.subscription?.status ?? "active";
      return (
        <span
          className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${STATUS_CHIP_CLASSES[s] ?? ""}`}
        >
          {STATUS_LABELS[s] ?? s}
        </span>
      );
    },
  },
  {
    key: "totalPlayers",
    label: "Jugadores",
    render: (row: AcademyRow) => String(row.totalPlayers),
  },
  {
    key: "createdAt",
    label: "Registro",
    render: (row: AcademyRow) =>
      new Date(row.createdAt as string).toLocaleDateString("es-EC"),
  },
];

export default function OwnerDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useOwnerStats();
  const { data: academies = [], isLoading: academiesLoading } =
    useOwnerAcademies();

  const recentAcademies = academies.slice(0, 5);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel de control"
        subtitle="Vista global de AcademyPro"
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Academias totales"
          value={stats?.totalAcademies ?? 0}
          icon={<Building2 size={20} />}
        />
        <StatCard
          label="Jugadores registrados"
          value={stats?.totalPlayers ?? 0}
          icon={<User size={20} />}
        />
        <StatCard
          label="Nuevas este mes"
          value={stats?.newAcademiesThisMonth ?? 0}
          icon={<TrendingUp size={20} />}
          trend={
            (stats?.newAcademiesThisMonth ?? 0) > 0
              ? `+${stats?.newAcademiesThisMonth} este mes`
              : undefined
          }
        />
        <StatCard
          label="MRR estimado"
          value={`$${(stats?.estimatedMRR ?? 0).toLocaleString()}`}
          icon={<DollarSign size={20} />}
        />
      </div>

      {/* Academies by plan */}
      <div>
        <h3 className="font-display text-[1.75rem] font-semibold text-on-surface mb-4">
          Academias por plan
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Free */}
          <div className="bg-surface-high rounded-3xl overflow-hidden">
            <div className="h-0.5 w-full bg-surface-highest" />
            <div className="p-6 text-center">
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-2">
                Free
              </p>
              <p className="font-display text-5xl font-bold text-primary leading-none">
                {stats?.academiesByPlan?.free ?? 0}
              </p>
            </div>
          </div>

          {/* Pro */}
          <div className="bg-surface-high rounded-3xl overflow-hidden">
            <div
              className="h-0.5 w-full"
              style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
            />
            <div className="p-6 text-center">
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-2">
                Pro
              </p>
              <p className="font-display text-5xl font-bold text-primary leading-none">
                {stats?.academiesByPlan?.pro ?? 0}
              </p>
            </div>
          </div>

          {/* Enterprise */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(188,245,33,0.1), rgba(0,244,254,0.1))",
            }}
          >
            <div
              className="h-0.5 w-full"
              style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
            />
            <div className="p-6 text-center">
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-2">
                Enterprise
              </p>
              <p className="font-display text-5xl font-bold text-primary leading-none">
                {stats?.academiesByPlan?.enterprise ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent academies */}
      <div>
        <h3 className="font-display text-[1.75rem] font-semibold text-on-surface mb-4">
          Academias recientes
        </h3>
        <DataTable
          columns={recentColumns as Parameters<typeof DataTable>[0]["columns"]}
          data={recentAcademies as AcademyRow[]}
          isLoading={academiesLoading}
          emptyMessage="No hay academias registradas."
          onRowClick={(row) => navigate(`/owner/academies/${(row as AcademyRow).id}`)}
        />
      </div>
    </div>
  );
}
