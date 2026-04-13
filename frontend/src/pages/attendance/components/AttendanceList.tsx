import { useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AttendancePlayerRow from "./AttendancePlayerRow";
import type { AttendanceRecord } from "@/types";
import type { BulkUpdateData } from "@/services/attendance.service";

interface AttendanceListProps {
  sessionId: string;
  records: AttendanceRecord[];
  onBulkUpdate: (data: BulkUpdateData) => Promise<void>;
  isLoading: boolean;
}

export default function AttendanceList({
  records,
  onBulkUpdate,
  isLoading,
}: AttendanceListProps) {
  const [localPresence, setLocalPresence] = useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      for (const r of records) {
        map[r.playerId] = r.present;
      }
      return map;
    },
  );
  const [isSaving, setIsSaving] = useState(false);

  const presentCount = Object.values(localPresence).filter(Boolean).length;
  const totalCount = records.length;

  function markAll(present: boolean) {
    const next: Record<string, boolean> = {};
    for (const r of records) {
      next[r.playerId] = present;
    }
    setLocalPresence(next);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onBulkUpdate({
        records: records.map((r) => ({
          playerId: r.playerId,
          present: localPresence[r.playerId] ?? r.present,
        })),
      });
      toast({ description: "Asistencia guardada correctamente" });
    } catch {
      // error toast is handled by the mutation's onError
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Counter */}
      <p className="font-body text-[0.875rem] text-on-surface-variant">
        {presentCount} de {totalCount} presentes
      </p>

      {/* Bulk actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => markAll(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-body text-[0.875rem] text-on-surface-variant hover:text-primary transition-colors"
        >
          <Check size={14} />
          Marcar todos presentes
        </button>
        <button
          type="button"
          onClick={() => markAll(false)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-body text-[0.875rem] text-on-surface-variant hover:text-primary transition-colors"
        >
          <X size={14} />
          Marcar todos ausentes
        </button>
      </div>

      {/* Player rows */}
      <div className="flex flex-col gap-1">
        {records.map((record, index) => (
          <AttendancePlayerRow
            key={record.id}
            record={record}
            present={localPresence[record.playerId] ?? record.present}
            onChange={(val) =>
              setLocalPresence((prev) => ({ ...prev, [record.playerId]: val }))
            }
            index={index}
          />
        ))}
      </div>

      {/* Save button — sticky on mobile */}
      <div className="sticky bottom-0 bg-surface-low pt-3 pb-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-body font-semibold text-[0.875rem] bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isSaving ? <LoadingSpinner size="sm" /> : null}
          Guardar asistencia
        </button>
      </div>
    </div>
  );
}
