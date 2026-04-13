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
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  emptyMessage = "No hay datos disponibles.",
  onRowClick,
}: DataTableProps<T>) {
  return (
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

      {/* Body */}
      {isLoading ? (
        // Skeleton rows
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
                  className="font-body text-[0.875rem] text-on-surface flex items-center"
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
