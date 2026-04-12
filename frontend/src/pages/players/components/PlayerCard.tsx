import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Users, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { toast } from '@/hooks/use-toast';
import { deletePlayer } from '@/services/players.service';
import type { PlayerResponse } from '@/services/players.service';
import type { UserRole } from '@/types';
import PlayerFormSheet from './PlayerFormSheet';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

interface PlayerCardProps {
  player: PlayerResponse;
  role: UserRole | null;
}

export default function PlayerCard({ player, role }: PlayerCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canEdit = role === 'academy_director' || role === 'coach';
  const canDelete = role === 'academy_director';

  const deletePlayerMutation = useMutation({
    mutationFn: () => deletePlayer(player.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      setDeleteOpen(false);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest('[data-dropdown]')) return;
    navigate(`/players/${player.id}`);
  }

  const age = calculateAge(player.birthDate);

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-surface-high rounded-3xl overflow-hidden hover:bg-surface-highest transition-colors cursor-pointer"
      >
        {/* Top glow */}
        <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />

        <div className="p-5 lg:p-6 flex flex-col gap-3">
          {/* Top row: avatar + name + dropdown */}
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {player.photoUrl ? (
              <img
                src={player.photoUrl}
                alt={player.fullName}
                className="shrink-0 w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="shrink-0 w-10 h-10 rounded-full bg-surface-highest flex items-center justify-center">
                <span className="font-display text-[0.875rem] font-semibold text-primary">
                  {getInitials(player.fullName)}
                </span>
              </div>
            )}

            {/* Name + position chip */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-[1.125rem] font-semibold text-on-surface leading-tight truncate">
                {player.fullName}
              </h3>
              {player.position && (
                <span className="inline-block mt-1 font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-secondary rounded-full px-3 py-1">
                  {player.position}
                </span>
              )}
            </div>

            {/* Dropdown — director or coach only */}
            {(canEdit || canDelete) && (
              <div data-dropdown onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="min-h-11 min-w-[44px] flex items-center justify-center rounded-xl text-on-surface-variant hover:text-on-surface transition-colors -mr-2 -mt-1">
                      <MoreVertical size={18} />
                      <span className="sr-only">Opciones</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        Editar
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="text-error-container hover:text-error-container"
                      >
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Team */}
          {player.team && (
            <div className="flex items-center gap-1.5 font-body text-[0.875rem] text-on-surface-variant">
              <Users size={14} />
              <span>{player.team.name}</span>
            </div>
          )}

          {/* Age */}
          <div className="flex items-center gap-1.5 font-body text-[0.875rem] text-on-surface-variant">
            <Calendar size={14} />
            <span>{age} años</span>
          </div>
        </div>
      </div>

      <PlayerFormSheet open={editOpen} onOpenChange={setEditOpen} player={player} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar jugador?"
        description={`¿Estás seguro de que deseas eliminar a ${player.fullName}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deletePlayerMutation.mutate()}
        isLoading={deletePlayerMutation.isPending}
      />
    </>
  );
}
