import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { usePlayerDetail } from '@/hooks/usePlayerDetail';
import { useAuthStore } from '@/store/auth.store';
import PlayerFormSheet from './components/PlayerFormSheet';
import PlayerAttendanceSummary from './components/PlayerAttendanceSummary';
import PlayerEvaluationHistory from './components/PlayerEvaluationHistory';
import PlayerParentsList from './components/PlayerParentsList';

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

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const canEdit = role === 'academy_director' || role === 'coach';

  const { player, attendanceSummary, evaluationProgress, isLoading, isError } =
    usePlayerDetail(id ?? '');

  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !player) {
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="tertiary"
          onClick={() => navigate('/players')}
          className="self-start gap-1.5 min-h-11 -ml-2"
        >
          <ChevronLeft size={16} />
          Jugadores
        </Button>
        <EmptyState message="Jugador no encontrado." />
      </div>
    );
  }

  const age = calculateAge(player.birthDate);

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Back button */}
        <Button
          variant="tertiary"
          onClick={() => navigate('/players')}
          className="self-start gap-1.5 min-h-11 -ml-2"
        >
          <ChevronLeft size={16} />
          Jugadores
        </Button>

        {/* Hero card */}
        <div className="bg-surface-high rounded-3xl overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-primary to-secondary" />
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* Avatar + info */}
              <div className="flex items-start gap-4">
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.fullName}
                    className="shrink-0 w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="shrink-0 w-20 h-20 rounded-full bg-surface-highest flex items-center justify-center">
                    <span className="font-display text-[2rem] font-bold text-primary">
                      {getInitials(player.fullName)}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <h1 className="font-display text-[2.5rem] lg:text-[3.5rem] font-bold text-on-surface leading-tight">
                    {player.fullName}
                  </h1>
                  {player.position && (
                    <span className="self-start font-body text-[0.6875rem] uppercase tracking-[0.05em] bg-surface-highest text-secondary rounded-full px-3 py-1">
                      {player.position}
                    </span>
                  )}
                  <div className="flex flex-col gap-1.5 mt-1">
                    {player.team && (
                      <div className="flex items-center gap-1.5 font-body text-[0.875rem] text-on-surface-variant">
                        <Users size={14} />
                        <span>{player.team.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 font-body text-[0.875rem] text-on-surface-variant">
                      <Calendar size={14} />
                      <span>{age} años</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-body text-[0.875rem] text-on-surface-variant">
                      <Calendar size={14} />
                      <span>
                        {new Date(player.birthDate).toLocaleDateString('es-EC')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              {canEdit && (
                <Button
                  variant="secondary"
                  onClick={() => setEditOpen(true)}
                  className="shrink-0 min-h-11"
                >
                  Editar jugador
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Attendance + Evaluations — 2 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <PlayerAttendanceSummary
              summary={attendanceSummary}
              isLoading={false}
            />
          </div>
          <div className="lg:col-span-5">
            <PlayerEvaluationHistory
              progress={evaluationProgress}
              isLoading={false}
              playerId={player.id}
            />
          </div>
        </div>

        {/* Parents — full width */}
        <PlayerParentsList
          parents={player.parents ?? []}
          playerId={player.id}
          role={role}
        />
      </div>

      <PlayerFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        player={player}
      />
    </>
  );
}
