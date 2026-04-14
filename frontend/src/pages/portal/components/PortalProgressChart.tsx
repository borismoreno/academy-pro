import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import type {
  EvaluationProgress,
  EvaluationProgressItem,
} from "@/services/players.service";

interface PortalProgressChartProps {
  progress: EvaluationProgress | undefined;
  isLoading: boolean;
}

interface ChartDataPoint {
  date: string;
  averageScore: number;
  evaluation: EvaluationProgressItem;
}

function buildChartData(
  evaluations: EvaluationProgressItem[],
): ChartDataPoint[] {
  return [...evaluations]
    .sort(
      (a, b) =>
        new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime(),
    )
    .map((ev) => {
      const scores = ev.scores.map((s) => s.score);
      const avg =
        scores.length > 0
          ? Math.round(
              (scores.reduce((a, b) => a + b, 0) / scores.length) * 10,
            ) / 10
          : 0;
      return {
        date: new Date(ev.evaluatedAt).toLocaleDateString("es-EC", {
          day: "numeric",
          month: "short",
        }),
        averageScore: avg,
        evaluation: ev,
      };
    });
}

function getTrendColor(data: ChartDataPoint[]): string {
  if (data.length < 2) return "#00f4fe";
  const first = data[0].averageScore;
  const last = data[data.length - 1].averageScore;
  if (last > first) return "#bcf521";
  if (last < first) return "#b92902";
  return "#00f4fe";
}

export default function PortalProgressChart({
  progress,
  isLoading,
}: PortalProgressChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />
        <div className="p-5 flex items-center justify-center min-h-55">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const evaluations = progress?.evaluations ?? [];
  const chartData = buildChartData(evaluations);
  const trendColor = getTrendColor(chartData);

  const showTrendIndicator = chartData.length >= 3;
  const isPositiveTrend =
    chartData.length >= 2 &&
    chartData[chartData.length - 1].averageScore > chartData[0].averageScore;
  const isNegativeTrend =
    chartData.length >= 2 &&
    chartData[chartData.length - 1].averageScore < chartData[0].averageScore;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleChartClick(data: any) {
    if (!data?.activePayload?.[0]) return;
    const point = data.activePayload[0].payload as ChartDataPoint;
    if (selectedPoint?.date === point.date) {
      setSelectedPoint(null);
    } else {
      setSelectedPoint(point);
    }
  }

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      {/* Top glow */}
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5">
        {/* Header */}
        <h3 className="font-display text-[1.75rem] font-semibold text-on-surface mb-4">
          Evolución del rendimiento
        </h3>

        {/* 0 evaluations */}
        {evaluations.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <TrendingUp size={32} className="text-on-surface-variant" />
            <p className="font-body text-[0.875rem] text-on-surface-variant max-w-xs">
              Aún no hay evaluaciones registradas. El gráfico aparecerá cuando
              el coach evalúe a tu hijo/a.
            </p>
          </div>
        )}

        {/* 1 evaluation */}
        {evaluations.length === 1 && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="font-display text-[3rem] text-primary font-bold">
              {chartData[0].averageScore}
            </span>
            <p className="font-body text-[0.875rem] text-on-surface-variant max-w-xs">
              Primera evaluación registrada. El progreso se mostrará con más
              evaluaciones.
            </p>
          </div>
        )}

        {/* 2+ evaluations */}
        {evaluations.length >= 2 && (
          <>
            {/* Trend indicator */}
            {showTrendIndicator && (
              <div className="flex items-center gap-1.5 mb-3">
                {isPositiveTrend && (
                  <>
                    <TrendingUp size={16} className="text-primary" />
                    <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-primary">
                      Tendencia positiva
                    </span>
                  </>
                )}
                {isNegativeTrend && (
                  <>
                    <TrendingDown size={16} className="text-error-container" />
                    <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-error-container">
                      Necesita atención
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Chart */}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={chartData}
                onClick={handleChartClick}
                style={{ cursor: "pointer" }}
              >
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#adaaaa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 5, 10]}
                  tick={{ fill: "#adaaaa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#201f1f",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ color: "#adaaaa", fontSize: 11 }}
                  itemStyle={{ color: trendColor, fontWeight: 600 }}
                  formatter={(value) => [`${value} / 10`, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  stroke={trendColor}
                  strokeWidth={3}
                  dot={{ fill: trendColor, r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: trendColor, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* 2-evaluation hint */}
            {evaluations.length === 2 && (
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-2 text-center">
                Con más evaluaciones verás la tendencia de progreso.
              </p>
            )}

            {/* Expandable detail panel */}
            <div
              className={[
                "overflow-hidden transition-all duration-300",
                selectedPoint ? "max-h-96" : "max-h-0",
              ].join(" ")}
            >
              {selectedPoint && (
                <div className="bg-surface-highest rounded-xl p-4 mt-3 relative">
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setSelectedPoint(null)}
                    className="absolute top-3 right-3 bg-transparent text-on-surface-variant hover:text-primary transition-colors p-1 rounded-xl"
                    aria-label="Cerrar detalle"
                  >
                    <X size={16} />
                  </button>

                  {/* Date */}
                  <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-3">
                    {new Date(
                      selectedPoint.evaluation.evaluatedAt,
                    ).toLocaleDateString("es-EC", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>

                  {/* Score list */}
                  <div className="flex flex-col gap-3">
                    {selectedPoint.evaluation.scores.map((score) => (
                      <div key={score.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-[0.875rem] text-on-surface-variant">
                            {score.metricName}
                          </span>
                          <span className="font-body text-[0.875rem] text-primary font-bold">
                            {score.score}
                          </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="h-0.75 w-full rounded-full bg-surface-high overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${(score.score / 10) * 100}%`,
                              backgroundColor: trendColor,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
