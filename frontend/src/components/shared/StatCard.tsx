import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
}

export default function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      {/* Top glow gradient line */}
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-6 relative">
        {/* Icon — top right */}
        {icon && (
          <div
            className="absolute top-6 right-6 text-on-surface-variant"
            style={{ fontSize: 20 }}
          >
            {icon}
          </div>
        )}

        {/* Label */}
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-3">
          {label}
        </p>

        {/* Value */}
        <p className="font-display text-[3.5rem] font-bold text-on-surface leading-none">
          {value}
        </p>

        {/* Trend */}
        {trend && (
          <p className="mt-2 font-body text-sm text-primary">{trend}</p>
        )}
      </div>
    </div>
  );
}
