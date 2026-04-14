import type { ReactNode } from "react";
import EmptyState from "./EmptyState";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  isLoading: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  mobileCard?: (row: Record<string, unknown>) => ReactNode;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  emptyMessage = "No hay datos disponibles.",
  onRowClick,
  mobileCard,
}: DataTableProps<T>) {
  const tableBody = isLoading ? (
    Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="grid px-4 py-4 animate-pulse bg-surface-high"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className="h-4 bg-surface-highest rounded-lg w-3/4"
          />
        ))}
      </div>
    ))
  ) : data.length === 0 ? (
    <div className="bg-surface-high">
      <EmptyState message={emptyMessage} />
    </div>
  ) : (
    data.map((row, rowIndex) => {
      const isEven = rowIndex % 2 === 0;
      return (
        <div
          key={rowIndex}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          className={[
            "grid px-4 py-4 transition-colors hover:bg-surface-highest",
            isEven ? "bg-surface-high" : "bg-surface-highest",
            onRowClick ? "cursor-pointer" : "",
          ].join(" ")}
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className="font-body text-sm text-on-surface flex items-center"
            >
              {col.render ? col.render(row) : String(row[col.key] ?? "—")}
            </div>
          ))}
        </div>
      );
    })
  );

  const tableJsx = (
    <div className="w-full rounded-3xl overflow-hidden">
      {/* Header row */}
      <div
        className="grid bg-surface-lowest px-4 py-3"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((col) => (
          <span
            key={col.key}
            className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
          >
            {col.label}
          </span>
        ))}
      </div>
      {tableBody}
    </div>
  );

  if (!mobileCard) {
    return <div className="overflow-x-auto">{tableJsx}</div>;
  }

  return (
    <div className="w-full">
      {/* Desktop table — hidden on mobile */}
      <div className="hidden lg:block">{tableJsx}</div>

      {/* Mobile card list — hidden on desktop */}
      <div className="flex flex-col gap-3 lg:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-high rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-px w-full bg-linear-to-r from-primary to-secondary" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-surface-highest rounded-lg w-2/3" />
                <div className="h-4 bg-surface-highest rounded-lg w-1/2" />
                <div className="h-4 bg-surface-highest rounded-lg w-3/4" />
              </div>
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="bg-surface-high rounded-xl">
            <EmptyState message={emptyMessage} />
          </div>
        ) : (
          data.map((row, i) => (
            <div
              key={i}
              className="bg-surface-high rounded-xl overflow-hidden"
            >
              <div className="h-px w-full bg-linear-to-r from-primary to-secondary" />
              <div className="p-4">
                {mobileCard(row as Record<string, unknown>)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
