import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ message, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {icon && (
        <div className="text-on-surface-variant" style={{ width: 48, height: 48 }}>
          {icon}
        </div>
      )}
      <p className="font-body text-sm text-on-surface-variant max-w-xs">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
