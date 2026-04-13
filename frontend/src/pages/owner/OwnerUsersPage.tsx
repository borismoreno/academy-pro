import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import { useOwnerUsers } from "@/hooks/useOwner";
import type { OwnerUser, UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  saas_owner: "Propietario",
  academy_director: "Director",
  coach: "Entrenador",
  parent: "Padre/Madre",
};

const ROLE_CHIP_CLASSES: Record<UserRole, string> = {
  saas_owner: "bg-secondary text-surface-lowest",
  academy_director: "bg-primary-container text-on-primary",
  coach: "bg-surface-highest text-on-surface",
  parent: "bg-surface-highest text-on-surface-variant",
};

type UserRow = Record<string, unknown> & OwnerUser;

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function OwnerUsersPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: users = [], isLoading } = useOwnerUsers(
    debouncedSearch || undefined,
  );

  const columns = [
    {
      key: "fullName",
      label: "Nombre",
      render: (row: UserRow) => (
        <span className="font-medium text-on-surface">{row.fullName}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row: UserRow) => (
        <span className="text-on-surface-variant text-[0.8125rem]">
          {row.email}
        </span>
      ),
    },
    {
      key: "academias",
      label: "Academias",
      render: (row: UserRow) => (
        <span className="text-on-surface">{row.academyRoles.length}</span>
      ),
    },
    {
      key: "roles",
      label: "Roles",
      render: (row: UserRow) => {
        const uniqueRoles = [
          ...new Set(row.academyRoles.map((r) => r.role)),
        ] as UserRole[];
        return (
          <div className="flex flex-wrap gap-1">
            {uniqueRoles.map((role) => (
              <span
                key={role}
                className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-2 py-0.5 ${ROLE_CHIP_CLASSES[role] ?? "bg-surface-highest text-on-surface-variant"}`}
              >
                {ROLE_LABELS[role] ?? role}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Registro",
      render: (row: UserRow) =>
        new Date(row.createdAt as string).toLocaleDateString("es-EC"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Usuarios" />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar usuario..."
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]["columns"]}
        data={users as UserRow[]}
        isLoading={isLoading}
        emptyMessage="No se encontraron usuarios."
      />
    </div>
  );
}
