import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { getPlayerProgress } from '@/services/evaluations.service';
import type { PlayerProgress } from '@/types';

interface EvaluationProgressChartProps {
  playerId: string;
}

const METRIC_COLORS = ['#bcf521', '#00f4fe', '#afe700', '#00696e'];

function formatDateTick(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

interface ChartDataPoint {
  date: string;
  [metricName: string]: number | string;
}

function buildChartData(progress: PlayerProgress): { data: ChartDataPoint[]; metrics: string[] } {
  const metricsSet = new Set<string>();
  for (const ev of progress.evaluations) {
    for (const s of ev.scores) {
      metricsSet.add(s.metricName);
    }
  }
  const metrics = Array.from(metricsSet);

  const data: ChartDataPoint[] = progress.evaluations
    .slice()
    .sort((a, b) => new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime())
    .map((ev) => {
      const point: ChartDataPoint = { date: ev.evaluatedAt };
      for (const s of ev.scores) {
        point[s.metricName] = s.score;
      }
      return point;
    });

  return { data, metrics };
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-highest rounded-xl p-3 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] flex flex-col gap-1.5">
      {label && (
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1">
          {formatDateTick(label)}
        </p>
      )}
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4">
          <span className="font-body text-[0.875rem] text-on-surface-variant">{item.name}</span>
          <span className="font-body text-[0.875rem] font-semibold" style={{ color: item.color }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function EvaluationProgressChart({ playerId }: EvaluationProgressChartProps) {
  const { data: progress, isLoading } = useQuery<PlayerProgress>({
    queryKey: ['player-progress', playerId],
    queryFn: () => getPlayerProgress(playerId),
    enabled: !!playerId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!progress || progress.evaluations.length === 0) {
    return <EmptyState message="Sin evaluaciones registradas." />;
  }

  const { data, metrics } = buildChartData(progress);
  const singlePoint = progress.evaluations.length === 1;

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={220} className="lg:!h-[280px]">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#201f1f" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            tick={{ fill: '#adaaaa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: '#adaaaa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#adaaaa',
              paddingTop: '8px',
            }}
          />
          {metrics.map((metric, idx) => {
            const color = METRIC_COLORS[idx % METRIC_COLORS.length];
            return (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {singlePoint && (
        <p className="font-body text-[0.875rem] text-on-surface-variant text-center">
          Registra más evaluaciones para ver el progreso del jugador.
        </p>
      )}
    </div>
  );
}
