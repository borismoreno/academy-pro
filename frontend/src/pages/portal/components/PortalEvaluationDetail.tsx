import { useEffect, useState } from "react";
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
import type { EvaluationProgress } from "@/services/portal.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: EvaluationProgress | undefined;
}

function EvaluationContent({ progress }: { progress: EvaluationProgress }) {
  const latest = [...progress.evaluations].sort(
    (a, b) =>
      new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime(),
  )[0];

  if (!latest) {
    return (
      <p className="font-body text-sm text-on-surface-variant mt-2">
        Sin evaluaciones aún.
      </p>
    );
  }

  const avg =
    latest.scores.reduce((sum, s) => sum + s.score, 0) / latest.scores.length;

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Date + average */}
      <div className="flex items-center justify-between">
        <span className="font-body text-sm text-on-surface-variant">
          {new Date(latest.evaluatedAt).toLocaleDateString("es-EC", {
            timeZone: "UTC",
          })}
        </span>
        <span className="font-display text-2xl font-bold text-primary">
          {avg.toFixed(1)}{" "}
          <span className="font-body text-sm text-on-surface-variant">
            / 10
          </span>
        </span>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-2">
        {[...latest.scores]
          .sort((a, b) => b.score - a.score)
          .map((score, index) => (
            <div
              key={score.metricId}
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                index % 2 === 0 ? "bg-surface-high" : "bg-surface-highest"
              }`}
            >
              <span className="font-body text-sm text-on-surface">
                {score.metricName}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-20 h-1.5 bg-surface-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-primary to-secondary rounded-full"
                    style={{ width: `${(score.score / 10) * 100}%` }}
                  />
                </div>
                <span className="font-display text-sm font-semibold text-primary w-6 text-right">
                  {score.score}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Coach notes */}
      {latest.coachNotes && (
        <div className="bg-surface-high rounded-xl px-4 py-3">
          <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1">
            Notas del entrenador
          </p>
          <p className="font-body text-sm text-on-surface italic">
            {latest.coachNotes}
          </p>
        </div>
      )}
    </div>
  );
}

export default function PortalEvaluationDetail({
  open,
  onOpenChange,
  progress,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const content =
    progress && progress.evaluations.length > 0 ? (
      <EvaluationContent progress={progress} />
    ) : (
      <p className="font-body text-sm text-on-surface-variant mt-2">
        Sin evaluaciones aún.
      </p>
    );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-surface-low rounded-t-3xl max-h-[80vh] overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle className="font-display text-lg font-semibold text-on-surface text-left">
              Última evaluación
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
            Última evaluación
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
