interface MetricScoreInputProps {
  metricName: string;
  value: number | null;
  onChange: (score: number) => void;
}

function getBarClasses(score: number | null): string {
  if (score === null) return "";
  if (score <= 3) return "from-error-container to-error-container/50";
  if (score <= 6) return "from-secondary to-secondary/50";
  return "from-primary to-secondary";
}

function getButtonNumberColor(score: number, selected: boolean): string {
  if (selected) return "";
  if (score <= 3) return "text-error-container/70";
  if (score >= 8) return "text-primary/70";
  return "";
}

export default function MetricScoreInput({
  metricName,
  value,
  onChange,
}: MetricScoreInputProps) {
  const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const barClasses = getBarClasses(value);

  return (
    <div className="bg-surface-highest rounded-xl p-4 flex flex-col gap-3">
      {/* Top row: metric name + selected score */}
      <div className="flex items-center justify-between">
        <span className="font-body text-sm font-medium text-on-surface">
          {metricName}
        </span>
        <span
          className={`font-display text-[1.75rem] leading-none font-bold ${
            value !== null ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          {value !== null ? value : "—"}
        </span>
      </div>

      {/* Score buttons */}
      <div className="flex gap-1.5 flex-wrap justify-between">
        {scores.map((s) => {
          const isSelected = value === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={[
                "min-w-10 h-10 rounded-lg font-body text-sm transition-all active:scale-95 cursor-pointer flex-1",
                isSelected
                  ? "bg-linear-to-br from-primary to-secondary text-on-primary font-bold scale-110 shadow-[0px_4px_12px_rgba(188,245,33,0.3)]"
                  : `bg-surface-low border border-outline-variant/15 hover:bg-surface-high hover:text-on-surface ${getButtonNumberColor(s, false)}`,
              ].join(" ")}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Color-coded feedback bar */}
      <div className="h-1 w-full rounded-full overflow-hidden bg-surface-low">
        {value !== null && (
          <div className={`h-full bg-linear-to-r ${barClasses} rounded-full`} />
        )}
      </div>
    </div>
  );
}
