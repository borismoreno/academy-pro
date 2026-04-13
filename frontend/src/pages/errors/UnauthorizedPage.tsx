import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { getDefaultRoute } from "@/config/navigation";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);

  const homeRoute = getDefaultRoute(role ?? "coach");

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-low px-4">
      <div className="w-full max-w-sm">
        {/* Top glow — Kinetic Edge card signature */}
        <div className="h-0.5 w-full bg-linear-to-r from-primary to-secondary rounded-t-3xl" />

        <div className="bg-surface-high rounded-b-[1.5rem] px-8 py-12 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 text-center">
          {/* Lock icon */}
          <div className="w-16 h-16 rounded-full bg-surface-highest flex items-center justify-center">
            <Lock size={28} className="text-on-surface-variant" />
          </div>

          {/* Copy */}
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[1.75rem] font-semibold text-on-surface leading-tight">
              Acceso no permitido
            </h1>
            <p className="font-body text-[0.875rem] text-on-surface-variant leading-relaxed">
              No tienes permiso para acceder a esta página.
            </p>
          </div>

          {/* CTA — gradient primary style */}
          <button
            onClick={() => navigate(homeRoute, { replace: true })}
            className="inline-flex items-center justify-center h-11 px-6 text-sm font-semibold rounded-xl bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 cursor-pointer"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
