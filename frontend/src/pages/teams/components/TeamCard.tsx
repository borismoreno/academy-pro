import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import TeamFormSheet from './TeamFormSheet';
import type { TeamResponse } from '@/services/dashboard.service';
import type { UserRole } from '@/types';
import { useTeams } from '@/hooks/useTeams';

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lun',
  TUESDAY: 'Mar',
  WEDNESDAY: 'Mié',
  THURSDAY: 'Jue',
  FRIDAY: 'Vie',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
};

interface TeamCardProps {
  team: TeamResponse;
  role: UserRole | null;
}

export default function TeamCard({ team, role }: TeamCardProps) {
  const navigate = useNavigate();
  const { deleteTeamMutation } = useTeams();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isDirector = role === 'academy_director';
  const headCoach = team.coaches.find((c) => c.isPrimary);
  const visibleSchedules = team.schedules.slice(0, 2);
  const extraSchedules = team.schedules.length - 2;

  function handleCardClick(e: React.MouseEvent) {
    // Prevent navigation when clicking dropdown
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown]')) return;
    navigate(`/teams/${team.id}`);
  }

  function handleDelete() {
    deleteTeamMutation.mutate(team.id, {
      onSuccess: () => setDeleteOpen(false),
    });
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-surface-high rounded-[1.5rem] overflow-hidden hover:bg-surface-highest transition-colors cursor-pointer"
      >
        {/* Top glow */}
        <div className="h-[2px] bg-gradient-to-r from-primary to-secondary" />

        <div className="p-5 lg:p-6 flex flex-col gap-3">
          {/* Top row: name + dropdown */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[1.125rem] font-semibold text-on-surface leading-tight">
              {team.name}
            </h3>

            {isDirector && (
              <div data-dropdown onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface transition-colors -mr-2 -mt-1">
                      <MoreVertical size={18} />
                      <span className="sr-only">Opciones</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteOpen(true)}
                      className="text-error-container hover:text-error-container"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Category chip */}
          {team.category && (
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-primary rounded-full px-3 py-1 self-start">
              {team.category}
            </span>
          )}

          {/* Player count */}
          <div className="flex items-center gap-1.5 font-body text-[0.875rem] text-on-surface-variant">
            <User size={14} />
            <span>
              {team.coaches.length} {team.coaches.length === 1 ? 'entrenador' : 'entrenadores'}
            </span>
          </div>

          {/* Head coach */}
          {headCoach && (
            <div className="flex items-center gap-1.5 font-body text-[0.875rem] text-on-surface-variant">
              <User size={14} />
              <span>{headCoach.user.fullName}</span>
            </div>
          )}

          {/* Schedule chips */}
          {team.schedules.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visibleSchedules.map((s) => (
                <span
                  key={s.id}
                  className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-on-surface-variant rounded-full px-2 py-1"
                >
                  {DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek} {s.startTime}
                </span>
              ))}
              {extraSchedules > 0 && (
                <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-on-surface-variant rounded-full px-2 py-1">
                  +{extraSchedules} más
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit sheet */}
      <TeamFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        team={team}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar equipo?"
        description={`¿Estás seguro de que deseas eliminar el equipo ${team.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteTeamMutation.isPending}
      />
    </>
  );
}
