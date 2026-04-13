import { Check, X } from "lucide-react";
import type { AttendanceRecord } from "@/types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

interface AttendancePlayerRowProps {
  record: AttendanceRecord;
  present: boolean;
  onChange: (present: boolean) => void;
  index: number;
}

export default function AttendancePlayerRow({
  record,
  present,
  onChange,
  index,
}: AttendancePlayerRowProps) {
  const isEven = index % 2 === 0;

  return (
    <div
      className={`flex items-center gap-4 px-3 py-3 lg:px-4 lg:py-4 rounded-xl min-h-[56px] ${
        isEven ? "bg-surface-high" : "bg-surface-highest"
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-surface-highest flex items-center justify-center">
        <span className="font-display text-[0.75rem] font-semibold text-primary">
          {getInitials(record.player.fullName)}
        </span>
      </div>

      {/* Name + position */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-[0.875rem] text-on-surface truncate">
          {record.player.fullName}
        </p>
        {record.player.position && (
          <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
            {record.player.position}
          </p>
        )}
      </div>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => onChange(!present)}
        className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 font-body text-[0.6875rem] uppercase tracking-[0.05em] transition-all active:scale-95 min-h-11 ${
          present
            ? "bg-primary text-on-primary"
            : "bg-surface-highest text-on-surface-variant"
        }`}
      >
        {present ? <Check size={14} /> : <X size={14} />}
        {present ? "Presente" : "Ausente"}
      </button>
    </div>
  );
}
