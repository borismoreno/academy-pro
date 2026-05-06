import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import CreateConceptSheet from "@/components/payments/CreateConceptSheet";
import { useGetConcepts, useGetPaymentSummary } from "@/hooks/usePayments";
import { useTeams } from "@/hooks/useTeams";
import { formatCurrency } from "@/lib/utils";
import type { PaymentConcept } from "@/types/payment.types";

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
}) {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
      <div className="p-4 sm:p-6 relative">
        {icon && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-on-surface-variant">
            {icon}
          </div>
        )}
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-2">
          {label}
        </p>
        <p className="font-display font-bold text-on-surface leading-none text-2xl sm:text-3xl lg:text-[2.5rem] truncate pr-6">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBar({ concept }: { concept: PaymentConcept }) {
  const total = concept.totalPlayers;
  if (total === 0)
    return <div className="h-2 bg-surface-highest rounded-full w-full" />;

  const paidPct = (concept.totalPaid / total) * 100;
  const pendingPct = (concept.totalPending / total) * 100;
  const overduePct = (concept.totalOverdue / total) * 100;

  return (
    <div className="flex h-2 rounded-full overflow-hidden w-full bg-surface-highest">
      {paidPct > 0 && (
        <div className="bg-primary h-full" style={{ width: `${paidPct}%` }} />
      )}
      {pendingPct > 0 && (
        <div
          className="bg-yellow-400 h-full"
          style={{ width: `${pendingPct}%` }}
        />
      )}
      {overduePct > 0 && (
        <div
          className="bg-error-container h-full"
          style={{ width: `${overduePct}%` }}
        />
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-EC");
}

const tableColumns = [
  { key: "name", label: "Concepto" },
  { key: "team", label: "Equipo" },
  { key: "amount", label: "Monto base" },
  { key: "dueDate", label: "Fecha límite" },
  { key: "totalPaid", label: "Pagados" },
  { key: "totalPending", label: "Pendientes" },
  { key: "totalOverdue", label: "Vencidos" },
];

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  const { teams, isLoading: isLoadingTeams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  const filters = {
    teamId: teamFilter || undefined,
    search: searchValue || undefined,
  };

  const { data: concepts = [], isLoading: isLoadingConcepts } =
    useGetConcepts(filters);
  const { data: summary, isLoading: isLoadingSummary } = useGetPaymentSummary();

  const tableData = concepts.map((c) => ({
    ...c,
    _concept: c,
  })) as unknown as Record<string, unknown>[];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pagos"
        action={
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-2 h-11 px-5 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap"
          >
            + Nuevo concepto
          </button>
        }
      />

      {/* Summary cards */}
      {isLoadingSummary ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Recaudado"
            value={formatCurrency(Number(summary.totalAmountCollected))}
            icon={<TrendingUp size={20} />}
          />
          <SummaryCard
            label="Por cobrar"
            value={formatCurrency(Number(summary.totalAmountPending))}
            icon={<Wallet size={20} />}
          />
          <SummaryCard
            label="Al día"
            value={summary.totalPaid}
            icon={<TrendingUp size={20} />}
          />
          <SummaryCard
            label="Vencidos"
            value={summary.totalOverdue}
            icon={<AlertCircle size={20} />}
          />
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar concepto..."
            className="w-full bg-surface-high border border-outline-variant/15 rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
          />
        </div>
        <div className="w-full sm:w-56">
          <SearchableSelect
            options={[
              { value: "all", label: "Todos los equipos" },
              ...activeTeams.map((t) => ({
                value: t.id,
                label: t.name,
                subtitle: t.category ?? undefined,
              })),
            ]}
            value={teamFilter || "all"}
            onValueChange={(val) => setTeamFilter(val === "all" ? "" : val)}
            placeholder="Filtrar por equipo"
            isLoading={isLoadingTeams}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          ...tableColumns,
          {
            key: "_progress",
            label: "Progreso",
            render: (row) => {
              const c = (row as unknown as { _concept: PaymentConcept })
                ._concept;
              return <StatusBar concept={c} />;
            },
          },
        ]}
        data={tableData.map((row) => {
          const c = (row as { _concept: PaymentConcept })._concept;
          return {
            ...row,
            name: c.name,
            team: c.team?.name ?? "—",
            amount: formatCurrency(Number(c.amount)),
            dueDate: formatDate(c.dueDate),
            totalPaid: String(c.totalPaid),
            totalPending: String(c.totalPending),
            totalOverdue: String(c.totalOverdue),
          };
        })}
        isLoading={isLoadingConcepts}
        emptyMessage="No hay conceptos de pago. Crea uno con el botón superior."
        onRowClick={(row) => {
          const id = (row as unknown as { id: string }).id;
          navigate(`/payments/${id}`);
        }}
        mobileCard={(row) => {
          const c = concepts.find((x) => x.id === (row as { id: string }).id);
          if (!c) return null;
          return (
            <div
              className="flex flex-col gap-3 cursor-pointer"
              onClick={() => navigate(`/payments/${c.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-base font-semibold text-on-surface">
                    {c.name}
                  </p>
                  <p className="font-body text-sm text-on-surface-variant mt-0.5">
                    {c.team?.name ?? "Sin equipo"} · {formatDate(c.dueDate)}
                  </p>
                </div>
                <span className="font-display text-base font-bold text-primary shrink-0">
                  {formatCurrency(Number(c.amount))}
                </span>
              </div>
              <StatusBar concept={c} />
              <div className="flex gap-4 font-body text-xs">
                <span className="text-primary">{c.totalPaid} pagados</span>
                <span className="text-yellow-400">
                  {c.totalPending} pendientes
                </span>
                {c.totalOverdue > 0 && (
                  <span className="text-error-container">
                    {c.totalOverdue} vencidos
                  </span>
                )}
              </div>
            </div>
          );
        }}
      />

      <CreateConceptSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
