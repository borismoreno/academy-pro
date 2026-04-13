import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AcademyFormDialog from "./components/AcademyFormDialog";
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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function OwnerAcademiesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const { data: academies = [], isLoading } = useOwnerAcademies(
    debouncedSearch || undefined,
  );

  const columns = [
    {
      key: "name",
      label: "Nombre",
      render: (row: AcademyRow) => (
        <span className="font-medium text-on-surface">{row.name}</span>
      ),
    },
    {
      key: "city",
      label: "Ciudad",
      render: (row: AcademyRow) => (
        <span className="text-on-surface-variant">{row.city ?? "—"}</span>
      ),
    },
    {
      key: "plan",
      label: "Plan",
      render: (row: AcademyRow) => {
        const plan = row.subscription?.plan ?? "free";
        return (
          <span
            className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${PLAN_CHIP_CLASSES[plan] ?? "bg-surface-highest text-on-surface-variant"}`}
          >
            {PLAN_LABELS[plan] ?? plan}
          </span>
        );
      },
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
      key: "director",
      label: "Director",
      render: (row: AcademyRow) =>
        row.director ? (
          <span className="text-on-surface-variant text-[0.8125rem]">
            {row.director.email}
          </span>
        ) : (
          <span className="text-on-surface-variant">—</span>
        ),
    },
    {
      key: "totalPlayers",
      label: "Jugadores",
      render: (row: AcademyRow) => String(row.totalPlayers),
    },
    {
      key: "totalTeams",
      label: "Equipos",
      render: (row: AcademyRow) => String(row.totalTeams),
    },
    {
      key: "createdAt",
      label: "Registro",
      render: (row: AcademyRow) =>
        new Date(row.createdAt as string).toLocaleDateString("es-EC"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academias"
        action={
          <Button
            variant="primary"
            className="gap-2 min-h-[44px]"
            onClick={() => setDialogOpen(true)}
          >
            <Plus size={16} />
            Nueva academia
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar academia..."
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]["columns"]}
        data={academies as AcademyRow[]}
        isLoading={isLoading}
        emptyMessage="No se encontraron academias."
        onRowClick={(row) => navigate(`/owner/academies/${(row as AcademyRow).id}`)}
      />

      <AcademyFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
