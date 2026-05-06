import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import EmptyState from '@/components/shared/EmptyState';
import { SearchableSelect } from '@/components/shared/SearchableSelect';
import CreateMatchSheet from '@/components/matches/CreateMatchSheet';
import { useGetMatches } from '@/hooks/useMatches';
import { useTeams } from '@/hooks/useTeams';
import { useAuthStore } from '@/store/auth.store';
import type { MatchSummary, MatchType } from '@/types/match.types';

const INPUT_CLASS =
  'w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary';

const SELECT_CLASS =
  'w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer';

function MatchTypeBadge({ type }: { type: MatchType }) {
  if (type === 'team_vs') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body bg-secondary-container text-white">
        Vs Rival
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-body bg-surface-highest text-on-surface-variant">
      Individual
    </span>
  );
}


export default function MatchesPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<MatchType | ''>('');

  const { teams, isLoading: isLoadingTeams } = useTeams();
  const activeTeams = teams.filter((t) => t.isActive);

  const filters = {
    search: search || undefined,
    teamId: teamFilter || undefined,
    matchType: typeFilter || undefined,
  };

  const { data: matches = [], isLoading } = useGetMatches(filters);

  const canCreate = role === 'academy_director' || role === 'coach';

  const tableData = matches.map((m) => ({
    ...m,
    matchDateFormatted: new Date(m.matchDate).toLocaleDateString('es-EC', {
      timeZone: 'UTC',
    }),
    teamName: m.team.name,
    resultStr:
      m.matchType === 'team_vs' &&
      m.scoreLocal !== null &&
      m.scoreVisitor !== null
        ? `${m.scoreLocal} - ${m.scoreVisitor}`
        : '—',
    opponentStr: m.opponent ?? '—',
    locationStr: m.location ?? '—',
  })) as unknown as Record<string, unknown>[];

  const columns = [
    {
      key: 'matchDateFormatted',
      label: 'Fecha',
      render: (row: Record<string, unknown>) => (
        <span>{String(row.matchDateFormatted)}</span>
      ),
    },
    {
      key: 'teamName',
      label: 'Equipo',
      render: (row: Record<string, unknown>) => (
        <span className="font-medium">{String(row.teamName)}</span>
      ),
    },
    {
      key: 'matchType',
      label: 'Tipo',
      render: (row: Record<string, unknown>) => (
        <MatchTypeBadge type={row.matchType as MatchType} />
      ),
    },
    {
      key: 'opponentStr',
      label: 'Rival',
      render: (row: Record<string, unknown>) => (
        <span className="text-on-surface-variant">{String(row.opponentStr)}</span>
      ),
    },
    {
      key: 'resultStr',
      label: 'Resultado',
      render: (row: Record<string, unknown>) => (
        <span className="font-display font-semibold text-primary">
          {String(row.resultStr)}
        </span>
      ),
    },
    {
      key: 'locationStr',
      label: 'Lugar',
      render: (row: Record<string, unknown>) => (
        <span className="text-on-surface-variant">{String(row.locationStr)}</span>
      ),
    },
    {
      key: 'lineupCount',
      label: 'Jugadores',
      render: (row: Record<string, unknown>) => (
        <span>{String(row.lineupCount ?? 0)}</span>
      ),
    },
  ];

  function mobileCard(row: Record<string, unknown>): ReactNode {
    const m = row as unknown as MatchSummary & {
      matchDateFormatted: string;
      resultStr: string;
      opponentStr: string;
    };
    return (
      <button
        className="w-full text-left"
        onClick={() => navigate(`/matches/${m.id}`)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-body font-medium text-on-surface truncate">
              {m.team.name}
            </span>
            <span className="font-body text-xs text-on-surface-variant">
              {m.matchDateFormatted}
            </span>
            <span className="font-body text-sm text-on-surface-variant truncate">
              {m.matchType === 'team_vs' && m.opponent
                ? `vs ${m.opponent}`
                : 'Individual'}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <MatchTypeBadge type={m.matchType} />
            {m.matchType === 'team_vs' &&
              m.scoreLocal !== null &&
              m.scoreVisitor !== null && (
                <span className="font-display font-bold text-primary text-sm">
                  {m.scoreLocal} — {m.scoreVisitor}
                </span>
              )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Encuentros"
        action={
          canCreate ? (
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 h-11 px-5 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap"
            >
              + Nuevo encuentro
            </button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por rival o lugar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${INPUT_CLASS} w-full sm:w-64`}
        />
        <div className="w-full sm:w-48">
          <SearchableSelect
            options={[
              { value: 'all', label: 'Todos los equipos' },
              ...activeTeams.map((t) => ({
                value: t.id,
                label: t.name,
                subtitle: t.category ?? undefined,
              })),
            ]}
            value={teamFilter || 'all'}
            onValueChange={(val) => setTeamFilter(val === 'all' ? '' : val)}
            placeholder="Todos los equipos"
            searchPlaceholder="Buscar equipo..."
            isLoading={isLoadingTeams}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MatchType | '')}
          className={`${SELECT_CLASS} w-full sm:w-48`}
        >
          <option value="" className="bg-surface-high">
            Todos los tipos
          </option>
          <option value="team_vs" className="bg-surface-high">
            Equipo vs Rival
          </option>
          <option value="individual" className="bg-surface-high">
            Individual
          </option>
        </select>
      </div>

      {/* Table */}
      {matches.length === 0 && !isLoading ? (
        <div className="bg-surface-high rounded-3xl overflow-hidden">
          <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
          <EmptyState
            icon={<Trophy size={32} className="text-on-surface-variant" />}
            message="Aún no hay encuentros registrados."
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          isLoading={isLoading}
          emptyMessage="No se encontraron encuentros."
          onRowClick={(row) => navigate(`/matches/${(row as Record<string, unknown>).id}`)}
          mobileCard={mobileCard}
        />
      )}

      <CreateMatchSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
