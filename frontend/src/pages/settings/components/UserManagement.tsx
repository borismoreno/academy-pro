import LoadingSpinner from '@/components/shared/LoadingSpinner';
import type { Member } from '@/types';

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    coach: 'Entrenador',
    parent: 'Padre / Tutor',
    academy_director: 'Director',
  };
  return labels[role] ?? role;
}

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface-high rounded-xl">
      <div className="w-9 h-9 rounded-full bg-surface-highest flex items-center justify-center shrink-0">
        <span className="font-body text-xs font-medium text-primary">
          {getInitials(member.fullName)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-on-surface truncate">{member.fullName}</p>
        <p className="font-body text-sm text-on-surface-variant truncate">{member.email}</p>
      </div>
      <span className="font-body text-[0.6875rem] bg-surface-highest text-on-surface-variant rounded-full px-2 py-1 shrink-0 whitespace-nowrap">
        {roleLabel(member.role)}
      </span>
    </div>
  );
}

interface Props {
  members: Member[];
  onInvite: () => void;
  isLoading: boolean;
}

export default function UserManagement({ members, onInvite, isLoading }: Props) {
  const coaches = members.filter((m) => m.role === 'coach');
  const parents = members.filter((m) => m.role === 'parent');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">Usuarios</h2>
        <button
          onClick={onInvite}
          className="flex items-center gap-2 h-11 px-5 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap shrink-0"
        >
          Invitar usuario
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Coaches */}
          <div className="flex flex-col gap-3">
            <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              Entrenadores
            </p>
            {coaches.length === 0 ? (
              <p className="font-body text-sm text-on-surface-variant">
                No hay entrenadores invitados.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {coaches.map((m) => (
                  <MemberRow key={m.userId} member={m} />
                ))}
              </div>
            )}
          </div>

          {/* Parents */}
          <div className="flex flex-col gap-3">
            <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              Padres y tutores
            </p>
            {parents.length === 0 ? (
              <p className="font-body text-sm text-on-surface-variant">
                No hay padres invitados.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {parents.map((m) => (
                  <MemberRow key={m.userId} member={m} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
