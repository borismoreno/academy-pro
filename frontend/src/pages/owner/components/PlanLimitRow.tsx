import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { PlanLimit } from "@/types";

const RESOURCE_LABELS: Record<string, string> = {
  teams: "Equipos",
  players: "Jugadores",
  coaches: "Entrenadores",
  fields: "Canchas",
};

interface PlanLimitRowProps {
  limit: PlanLimit;
  onUpdate: (id: string, maxCount: number) => Promise<void>;
}

export default function PlanLimitRow({ limit, onUpdate }: PlanLimitRowProps) {
  const [value, setValue] = useState(String(limit.maxCount));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < -1) {
      setError("Ingresa un número válido (mínimo -1)");
      return;
    }
    if (parsed === limit.maxCount) return;

    setError("");
    setIsSaving(true);
    try {
      await onUpdate(limit.id, parsed);
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-surface-high rounded-xl">
      <span className="font-body text-sm text-on-surface">
        {RESOURCE_LABELS[limit.resource] ?? limit.resource}
      </span>

      <div className="flex flex-col items-end gap-1">
        <div className="relative">
          {isSaving ? (
            <div className="w-24 h-10 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <input
              type="number"
              value={value}
              min={-1}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-24 h-10 text-center rounded-xl border border-outline-variant/15 bg-surface-low font-body text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          )}
        </div>
        {error ? (
          <span className="font-body text-[0.6875rem] text-error-container">
            {error}
          </span>
        ) : (
          <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
            -1 = ilimitado
          </span>
        )}
      </div>
    </div>
  );
}
