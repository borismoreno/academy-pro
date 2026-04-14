import { useState } from "react";
import type { DotProps } from "recharts";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
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

interface MetricScore {
  metricId: string;
  metricName: string;
  score: number;
}

interface ChartDataPoint {
  date: string;
  averageScore: number;
  metrics: MetricScore[];
  evaluatedAt: string;
}

type ActiveDotProps = DotProps & { payload?: ChartDataPoint };

function buildChartData(
  evaluations: EvaluationProgressItem[],
): ChartDataPoint[] {
  return [...evaluations]
    .sort(
      (a, b) =>
        new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime(),
    )
    .map((ev) => {
      const rawScores = ev.scores.map((s) => s.score);
      const avg =
        rawScores.length > 0
          ? parseFloat(
              (
                rawScores.reduce((a, b) => a + b, 0) / rawScores.length
              ).toFixed(1),
            )
          : 0;
      return {
        date: new Date(ev.evaluatedAt).toLocaleDateString("es-EC", {
          day: "numeric",
          month: "short",
        }),
        averageScore: avg,
        metrics: ev.scores.map((s) => ({
          metricId: s.metricId,
          metricName: s.metricName,
          score: s.score,
        })),
        evaluatedAt: ev.evaluatedAt,
      };
    });
}

function calculateTrend(
  data: ChartDataPoint[],
): "positive" | "negative" | "neutral" {
  if (data.length < 3) return "neutral";

  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  const avgFirst =
    firstHalf.reduce((sum, d) => sum + d.averageScore, 0) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce((sum, d) => sum + d.averageScore, 0) / secondHalf.length;

  const difference = avgSecond - avgFirst;

  if (difference > 0.3) return "positive";
  if (difference < -0.5) return "negative";
  return "neutral";
}

function getTrendColor(
  trend: "positive" | "negative" | "neutral",
): string {
  if (trend === "positive") return "#bcf521";
  if (trend === "negative") return "#f97316";
  return "#00f4fe";
}

export default function PortalProgressChart({
  progress,
  isLoading,
}: PortalProgressChartProps) {
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<ChartDataPoint | null>(null);

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
  const trend = calculateTrend(chartData);
  const trendColor = getTrendColor(trend);

  // Fix 1 — Dynamic Y axis
  const scores = chartData.map((d) => d.averageScore);
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 10;
  const yMin = Math.max(0, Math.floor(minScore) - 1);
  const yMax = Math.min(10, Math.ceil(maxScore) + 1);
  const tickCount = 4;
  const step = Math.ceil((yMax - yMin) / (tickCount - 1));
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    Math.min(yMin + i * step, yMax),
  );

  // Overall average reference line
  const overallAverage =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "0";

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      {/* Top glow */}
      <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary" />

      <div className="p-5">
        {/* Fix 3 — Header with inline trend indicator */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[1.75rem] text-on-surface">
            Evolución del rendimiento
          </h2>
          {trend !== "neutral" && chartData.length >= 3 && (
            <div
              className={`flex items-center gap-1 ${
                trend === "positive" ? "text-primary" : "text-[#f97316]"
              }`}
            >
              {trend === "positive" ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span className="text-xs font-medium">
                {trend === "positive" ? "En ascenso" : "Revisar"}
              </span>
            </div>
          )}
        </div>

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
            {/* Fix 1 + 4 — Chart with dynamic axis, activeDot click, and reference line */}
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#adaaaa", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[yMin, yMax]}
                  ticks={ticks}
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
                <ReferenceLine
                  y={parseFloat(overallAverage)}
                  stroke="#adaaaa"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: `Promedio: ${overallAverage}`,
                    position: "insideTopRight",
                    fill: "#adaaaa",
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  stroke={trendColor}
                  strokeWidth={3}
                  dot={{ fill: trendColor, r: 5, strokeWidth: 0 }}
                  activeDot={{
                    r: 8,
                    fill: trendColor,
                    strokeWidth: 2,
                    stroke: "#0e0e0e",
                    onClick: (dotProps: DotProps) => {
                      const point = (dotProps as ActiveDotProps).payload;
                      if (point) {
                        setSelectedEvaluation(
                          selectedEvaluation?.date === point.date
                            ? null
                            : point,
                        );
                      }
                    },
                    style: { cursor: "pointer" },
                  }}
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
              className={`overflow-hidden transition-all duration-300 ${
                selectedEvaluation ? "max-h-96 mt-3" : "max-h-0"
              }`}
            >
              <div className="bg-surface-highest rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
                    {selectedEvaluation &&
                      new Date(
                        selectedEvaluation.evaluatedAt,
                      ).toLocaleDateString("es-EC", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedEvaluation(null)}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    <X size={16} />
                  </button>
                </div>
                {/* Score */}
                <p
                  className="font-display text-[2rem] font-bold mb-3"
                  style={{ color: trendColor }}
                >
                  {selectedEvaluation?.averageScore}{" "}
                  <span className="text-sm text-on-surface-variant font-body">
                    / 10
                  </span>
                </p>
                {/* Metric scores */}
                <div className="flex flex-col gap-2">
                  {selectedEvaluation?.metrics?.map((metric) => (
                    <div key={metric.metricId}>
                      <div className="flex justify-between mb-1">
                        <span className="font-body text-[0.875rem] text-on-surface-variant">
                          {metric.metricName}
                        </span>
                        <span className="font-body text-[0.875rem] font-medium text-on-surface">
                          {metric.score}/10
                        </span>
                      </div>
                      <div className="h-1 bg-surface-low rounded-full overflow-hidden">
                        <div
                          className="h-1 rounded-full bg-linear-to-r from-primary to-secondary"
                          style={{ width: `${(metric.score / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
