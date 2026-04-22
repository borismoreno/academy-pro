import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { AttendanceSummary } from "@/services/portal.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: AttendanceSummary | undefined;
}

function formatDate(dateStr: string): string {
  const formatted = new Date(dateStr).toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function SessionList({ summary }: { summary: AttendanceSummary }) {
  const sorted = [...summary.sessions].sort(
    (a, b) =>
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
  );

  return (
    <div className="flex flex-col gap-2 mt-2">
      {sorted.map((session, index) => (
        <div
          key={session.sessionId}
          className={`flex items-center justify-between px-4 py-3 rounded-xl ${
            index % 2 === 0 ? "bg-surface-high" : "bg-surface-highest"
          }`}
        >
          <span className="font-body text-sm text-on-surface">
            {formatDate(session.sessionDate)}
          </span>
          <span
            className={`flex items-center gap-1.5 font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${
              session.present
                ? "bg-primary-container text-on-primary"
                : "bg-error-container text-on-surface"
            }`}
          >
            {session.present ? <Check size={12} /> : <X size={12} />}
            {session.present ? "Presente" : "Ausente"}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PortalAttendanceDetail({
  open,
  onOpenChange,
  summary,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const content = summary ? (
    <SessionList summary={summary} />
  ) : (
    <p className="font-body text-sm text-on-surface-variant mt-2">
      Sin sesiones registradas.
    </p>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-surface-low rounded-t-3xl max-h-[80vh] overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle className="font-display text-lg font-semibold text-on-surface text-left">
              Historial de asistencia
            </SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-low rounded-3xl max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold text-on-surface">
            Historial de asistencia
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
