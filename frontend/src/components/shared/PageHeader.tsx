import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h2 className="font-display text-[1.75rem] font-semibold text-on-surface leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 font-body text-[0.875rem] text-on-surface-variant">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}
