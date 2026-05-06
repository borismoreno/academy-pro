import { useState } from 'react';
import { Plus, Pencil, Check, X } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useGetMetrics, useCreateMetric, useUpdateMetric } from '@/hooks/useMatches';
import type { MatchStatMetric, StatType, CreateMatchStatMetricData } from '@/types/match.types';

const INPUT_CLASS =
  'w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50';

const SELECT_CLASS =
  'w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer';

const STAT_TYPE_OPTIONS: { value: StatType; label: string }[] = [
  { value: 'count', label: 'Contador' },
  { value: 'time_seconds', label: 'Tiempo (seg)' },
  { value: 'distance_meters', label: 'Distancia (m)' },
  { value: 'rating', label: 'Puntuación 1-10' },
  { value: 'boolean', label: 'Sí / No' },
];

function statTypeLabel(st: StatType): string {
  return STAT_TYPE_OPTIONS.find((o) => o.value === st)?.label ?? st;
}

// ── Row ───────────────────────────────────────────────────────────────────────

interface MetricRowProps {
  metric: MatchStatMetric;
  onUpdate: (id: string, data: { name?: string; unitLabel?: string; isActive?: boolean }) => void;
  isUpdating: boolean;
}

function MetricRow({ metric, onUpdate, isUpdating }: MetricRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(metric.name);
  const [unitLabel, setUnitLabel] = useState(metric.unitLabel ?? '');

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onUpdate(metric.id, {
      name: trimmed,
      unitLabel: unitLabel.trim() || undefined,
    });
    setEditing(false);
  }

  function handleCancel() {
    setName(metric.name);
    setUnitLabel(metric.unitLabel ?? '');
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {editing ? (
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="flex-1 min-w-32 bg-surface-low border border-primary rounded-lg px-3 py-1.5 font-body text-sm text-on-surface focus:outline-none"
          />
          <input
            type="text"
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
            placeholder="Etiqueta (ej: km)"
            className="w-28 bg-surface-low border border-outline-variant/15 rounded-lg px-3 py-1.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg bg-surface-highest text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
            <span
              className={[
                'font-body text-sm',
                metric.isActive ? 'text-on-surface' : 'text-on-surface-variant line-through',
              ].join(' ')}
            >
              {metric.name}
            </span>
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] px-2 py-0.5 rounded-full bg-surface-highest text-secondary">
              {statTypeLabel(metric.statType)}
            </span>
            {metric.unitLabel && (
              <span className="font-body text-xs text-on-surface-variant">
                ({metric.unitLabel})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Active toggle */}
            <button
              onClick={() => onUpdate(metric.id, { isActive: !metric.isActive })}
              disabled={isUpdating}
              className={[
                'w-9 h-5 rounded-full transition-colors cursor-pointer relative disabled:opacity-50',
                metric.isActive ? 'bg-primary' : 'bg-surface-highest',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                  metric.isActive ? 'translate-x-4' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <Pencil size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Add form ──────────────────────────────────────────────────────────────────

interface AddMetricFormProps {
  onCreate: (data: CreateMatchStatMetricData) => void;
  isCreating: boolean;
  onCancel: () => void;
}

function AddMetricForm({ onCreate, isCreating, onCancel }: AddMetricFormProps) {
  const [name, setName] = useState('');
  const [statType, setStatType] = useState<StatType>('count');
  const [unitLabel, setUnitLabel] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    onCreate({
      name: name.trim(),
      statType,
      unitLabel: unitLabel.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-surface-highest rounded-2xl">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-40">
          <label className="font-body text-xs text-on-surface-variant mb-1 block">
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="Ej: Goles, Asistencias..."
            autoFocus
            className={INPUT_CLASS}
          />
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
        <div className="w-40">
          <label className="font-body text-xs text-on-surface-variant mb-1 block">
            Tipo
          </label>
          <select
            value={statType}
            onChange={(e) => setStatType(e.target.value as StatType)}
            className={SELECT_CLASS}
          >
            {STAT_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-surface-high">
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="font-body text-xs text-on-surface-variant mb-1 block">
            Etiqueta
          </label>
          <input
            type="text"
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
            placeholder="m, km, seg..."
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-xl font-body text-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isCreating}
          className="h-9 px-4 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
        >
          {isCreating ? <LoadingSpinner size="sm" /> : 'Guardar métrica'}
        </button>
      </div>
    </form>
  );
}

// ── Manager ───────────────────────────────────────────────────────────────────

export default function MatchStatMetricsManager() {
  const [showAdd, setShowAdd] = useState(false);
  const { data: metrics = [], isLoading } = useGetMetrics();
  const createMetric = useCreateMetric();
  const updateMetric = useUpdateMetric();

  function handleCreate(data: CreateMatchStatMetricData) {
    createMetric.mutate(data, { onSuccess: () => setShowAdd(false) });
  }

  function handleUpdate(metricId: string, data: { name?: string; unitLabel?: string; isActive?: boolean }) {
    updateMetric.mutate({ metricId, data });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-on-surface">
            Métricas de encuentro
          </h3>
          <p className="font-body text-sm text-on-surface-variant mt-0.5">
            Configura las estadísticas a registrar por jugador en cada encuentro.
          </p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl font-body font-medium text-sm bg-surface-highest text-primary hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Agregar
          </button>
        )}
      </div>

      {showAdd && (
        <AddMetricForm
          onCreate={handleCreate}
          isCreating={createMetric.isPending}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {metrics.length === 0 && !showAdd ? (
        <div className="bg-surface-high rounded-2xl p-8 text-center">
          <p className="font-body text-sm text-on-surface-variant">
            No hay métricas configuradas. Agrega la primera para empezar a registrar estadísticas.
          </p>
        </div>
      ) : (
        <div className="bg-surface-high rounded-2xl overflow-hidden">
          {metrics.map((metric: MatchStatMetric, i) => (
            <div
              key={metric.id}
              className={i < metrics.length - 1 ? 'border-b border-surface-highest' : ''}
            >
              <MetricRow
                metric={metric}
                onUpdate={handleUpdate}
                isUpdating={updateMetric.isPending}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
