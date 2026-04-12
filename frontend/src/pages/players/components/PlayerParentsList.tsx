import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { PlayerParent } from '@/services/players.service';
import type { UserRole } from '@/types';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import EmptyState from '@/components/shared/EmptyState';
import { usePlayerDetail } from '@/hooks/usePlayerDetail';
import AddParentSheet from './AddParentSheet';

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

interface Props {
  parents: PlayerParent[];
  playerId: string;
  role: UserRole | null;
}

export default function PlayerParentsList({ parents, playerId, role }: Props) {
  const { removeParentMutation } = usePlayerDetail(playerId);
  const [addOpen, setAddOpen] = useState(false);
  const [removeUserId, setRemoveUserId] = useState<string | null>(null);

  const isDirector = role === 'academy_director';
  const parentToRemove = parents.find((p) => p.userId === removeUserId);

  function handleRemove() {
    if (!removeUserId) return;
    removeParentMutation.mutate(removeUserId, {
      onSuccess: () => setRemoveUserId(null),
    });
  }

  return (
    <>
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
        <div className="p-5 lg:p-6 flex flex-col gap-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
              Padres y tutores
            </h3>
            {isDirector && (
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 min-h-11 px-3 font-body text-[0.875rem] text-on-surface-variant hover:text-primary transition-colors rounded-xl"
              >
                <Plus size={16} />
                Vincular
              </button>
            )}
          </div>

          {/* List */}
          {parents.length === 0 ? (
            <EmptyState message="No hay padres o tutores vinculados." />
          ) : (
            <div className="flex flex-col gap-3">
              {parents.map((parent) => (
                <div key={parent.id} className="flex items-center gap-3 min-h-11">
                  {/* Avatar */}
                  <div className="shrink-0 w-10 h-10 rounded-full bg-surface-highest flex items-center justify-center">
                    <span className="font-body text-[0.6875rem] font-semibold text-primary">
                      {getInitials(parent.user.fullName)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body text-[0.875rem] text-on-surface">
                        {parent.user.fullName}
                      </span>
                      {parent.relationship && (
                        <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-on-surface-variant rounded-full px-2 py-1">
                          {parent.relationship}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-[0.875rem] text-on-surface-variant truncate">
                      {parent.user.email}
                    </p>
                  </div>

                  {/* Remove */}
                  {isDirector && (
                    <button
                      onClick={() => setRemoveUserId(parent.userId)}
                      className="shrink-0 min-h-11 min-w-[44px] flex items-center justify-center rounded-xl text-on-surface-variant hover:text-error-container transition-colors"
                    >
                      <X size={16} />
                      <span className="sr-only">Desvincular</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddParentSheet open={addOpen} onOpenChange={setAddOpen} playerId={playerId} />

      <ConfirmDialog
        open={!!removeUserId}
        onOpenChange={(open) => {
          if (!open) setRemoveUserId(null);
        }}
        title="¿Desvincular padre/tutor?"
        description={`¿Estás seguro de que deseas desvincular a ${parentToRemove?.user.fullName ?? ''}?`}
        confirmLabel="Desvincular"
        variant="destructive"
        onConfirm={handleRemove}
        isLoading={removeParentMutation.isPending}
      />
    </>
  );
}
