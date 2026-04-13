import type { PlayerResponse } from '@/services/portal.service';

interface PlayerSelectorProps {
  players: PlayerResponse[];
  selectedPlayerId: string | null;
  onSelect: (id: string) => void;
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function PlayerSelector({
  players,
  selectedPlayerId,
  onSelect,
}: PlayerSelectorProps) {
  if (players.length < 2) return null;

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
        {players.map((player) => {
          const isSelected = player.id === selectedPlayerId;

          return (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className={[
                'flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-200',
                'min-h-[56px] focus:outline-none',
                isSelected
                  ? 'bg-linear-to-br from-primary to-secondary text-on-primary font-medium'
                  : 'bg-surface-high text-on-surface-variant',
              ].join(' ')}
            >
              {/* Avatar */}
              <div
                className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ width: 36, height: 36 }}
              >
                {player.photoUrl ? (
                  <img
                    src={player.photoUrl}
                    alt={player.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={[
                      'w-full h-full flex items-center justify-center font-display font-bold text-[0.75rem]',
                      isSelected ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-highest text-primary',
                    ].join(' ')}
                  >
                    {getInitials(player.fullName)}
                  </div>
                )}
              </div>

              {/* First name */}
              <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] leading-none">
                {player.fullName.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
