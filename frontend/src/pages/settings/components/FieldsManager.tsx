import { useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FieldFormSheet from './FieldFormSheet';
import { useFields } from '@/hooks/useFields';
import type { Field } from '@/types';

// ── Field row ─────────────────────────────────────────────────────────────────

interface FieldRowProps {
  field: Field;
  onEdit: (field: Field) => void;
  onDelete: (field: Field) => void;
  isDeleting: boolean;
}

function FieldRow({ field, onEdit, onDelete, isDeleting }: FieldRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-4 bg-surface-high rounded-xl">
        {/* Icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary shrink-0">
          <MapPin size={18} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-[0.875rem] font-medium text-on-surface truncate">
            {field.name}
          </p>
          {field.location ? (
            <p className="font-body text-[0.875rem] text-on-surface-variant truncate">
              {field.location}
            </p>
          ) : (
            <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant italic">
              Sin ubicación especificada
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(field)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            aria-label="Editar cancha"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-on-surface-variant hover:text-error-container transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Eliminar cancha"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Eliminar cancha?"
        description={`¿Estás seguro de que deseas eliminar la cancha ${field.name}? Si tiene horarios asignados no podrá eliminarse.`}
        confirmLabel="Eliminar"
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(field);
        }}
        isLoading={isDeleting}
        variant="destructive"
      />
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FieldsManager() {
  const { fields, isLoading, deleteFieldMutation } = useFields();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  function handleAdd() {
    setSelectedField(null);
    setSheetOpen(true);
  }

  function handleEdit(field: Field) {
    setSelectedField(field);
    setSheetOpen(true);
  }

  function handleDelete(field: Field) {
    deleteFieldMutation.mutate(field.id);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
            Canchas
          </h2>
          <p className="font-body text-[0.875rem] text-on-surface-variant mt-1">
            Administra las canchas disponibles en tu academia.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl font-body font-semibold text-[0.875rem] bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Agregar cancha
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : fields.length === 0 ? (
        <EmptyState
          icon={<MapPin size={48} />}
          message="No hay canchas registradas."
          action={
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl font-body font-semibold text-[0.875rem] bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer"
            >
              <Plus size={16} />
              Agregar cancha
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((field) => (
            <FieldRow
              key={field.id}
              field={field}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteFieldMutation.isPending}
            />
          ))}
        </div>
      )}

      <FieldFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        field={selectedField}
      />
    </div>
  );
}
