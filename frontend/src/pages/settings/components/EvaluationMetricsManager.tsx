import { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Metric } from '@/types';
import type { CreateMetricData, UpdateMetricData } from '@/services/settings.service';

// ── Metric row ────────────────────────────────────────────────────────────────

interface MetricRowProps {
  metric: Metric;
  onUpdate: (id: string, data: UpdateMetricData) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

function MetricRow({ metric, onUpdate, onDelete, isUpdating, isDeleting }: MetricRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(metric.metricName);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleNameClick() {
    setEditName(metric.metricName);
    setIsEditing(true);
  }

  function handleNameBlur() {
    setIsEditing(false);
    const trimmed = editName.trim();
    if (trimmed.length >= 2 && trimmed !== metric.metricName) {
      onUpdate(metric.id, { metricName: trimmed });
    } else {
      setEditName(metric.metricName);
    }
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setEditName(metric.metricName);
      setIsEditing(false);
    }
  }

  function handleToggleActive() {
    onUpdate(metric.id, { isActive: !metric.isActive });
  }

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-3 bg-surface-high rounded-xl">
        {/* Drag handle (visual only for MVP) */}
        <GripVertical
          size={16}
          className="text-on-surface-variant shrink-0 cursor-grab"
        />

        {/* Metric name — inline editable */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="h-8 py-1"
            />
          ) : (
            <button
              type="button"
              onClick={handleNameClick}
              className="font-body text-[0.875rem] text-on-surface text-left w-full truncate hover:text-primary transition-colors cursor-text"
            >
              {metric.metricName}
            </button>
          )}
        </div>

        {/* isActive toggle */}
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={isUpdating}
          className={[
            'flex items-center gap-1.5 h-7 px-3 rounded-full font-body text-[0.6875rem] transition-all disabled:opacity-50 cursor-pointer shrink-0',
            metric.isActive
              ? 'bg-primary/10 text-primary'
              : 'bg-surface-highest text-on-surface-variant',
          ].join(' ')}
        >
          <span
            className={[
              'w-2 h-2 rounded-full',
              metric.isActive ? 'bg-primary' : 'bg-on-surface-variant',
            ].join(' ')}
          />
          {metric.isActive ? 'Activa' : 'Inactiva'}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={isDeleting}
          className="p-1 rounded-lg text-on-surface-variant hover:text-error-container transition-colors disabled:opacity-50 cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Eliminar métrica?"
        description="Si esta métrica tiene evaluaciones registradas no podrá eliminarse. Puedes desactivarla en su lugar."
        confirmLabel="Eliminar"
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(metric.id);
        }}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  metrics: Metric[];
  onCreate: (data: CreateMetricData) => void;
  onUpdate: (id: string, data: UpdateMetricData) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export default function EvaluationMetricsManager({
  metrics,
  onCreate,
  onUpdate,
  onDelete,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
}: Props) {
  const [newMetricName, setNewMetricName] = useState('');

  const sorted = [...metrics].sort((a, b) => a.sortOrder - b.sortOrder);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newMetricName.trim();
    if (trimmed.length < 2) return;
    onCreate({ metricName: trimmed, sortOrder: metrics.length });
    setNewMetricName('');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
          Métricas de evaluación
        </h2>
        <p className="font-body text-[0.875rem] text-on-surface-variant mt-1">
          Configura las métricas con las que se evalúa a los jugadores.
        </p>
      </div>

      {/* Add metric */}
      <form onSubmit={handleCreate} className="flex gap-3">
        <Input
          value={newMetricName}
          onChange={(e) => setNewMetricName(e.target.value)}
          placeholder="Nueva métrica..."
          disabled={isCreating}
          className="flex-1"
        />
        <button
          type="submit"
          disabled={isCreating || newMetricName.trim().length < 2}
          className="flex items-center gap-2 h-11 px-5 rounded-xl font-body font-semibold text-[0.875rem] bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap shrink-0"
        >
          {isCreating && <LoadingSpinner size="sm" />}
          Agregar
        </button>
      </form>

      {/* Metrics list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="font-body text-[0.875rem] text-on-surface-variant">
          No hay métricas configuradas.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((metric) => (
            <MetricRow
              key={metric.id}
              metric={metric}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
