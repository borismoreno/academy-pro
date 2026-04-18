import { useState } from "react";
import { Link } from "react-router-dom";
import { XCircle, Mail, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAcceptInvitation } from "@/hooks/useAcceptInvitation";
import type { UserRole } from "@/types";
import { getLandingURL } from "@/config/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleChip(role: UserRole): { label: string; className: string } {
  switch (role) {
    case "coach":
      return {
        label: "Entrenador",
        className: "bg-secondary/20 text-secondary",
      };
    case "parent":
      return {
        label: "Padre / Tutor",
        className: "bg-primary/20 text-primary",
      };
    case "academy_director":
      return { label: "Director", className: "bg-primary/20 text-primary" };
    default:
      return { label: role, className: "bg-primary/20 text-primary" };
  }
}

// ─── Shared layout pieces ─────────────────────────────────────────────────────

function DecorativePanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-surface-lowest relative overflow-hidden flex-col items-center justify-center p-16">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, #bcf521 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #00f4fe 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-125 h-125 rounded-full opacity-5"
        style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
      />
      <div
        className="absolute -top-24 -left-24 w-75 h-75 rounded-full opacity-5"
        style={{ background: "linear-gradient(135deg, #00f4fe, #bcf521)" }}
      />
      <div className="relative z-10 max-w-md">
        <div className="mb-8">
          <span className="font-display text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
            Cancha360
          </span>
        </div>
        <h1 className="font-display text-[3.5rem] font-bold text-on-surface leading-[1.1] mb-6">
          Únete a tu
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #bcf521, #00f4fe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            academia
          </span>
          <br />
          hoy mismo.
        </h1>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          Has sido invitado a formar parte de una academia deportiva. Crea tu
          cuenta para acceder a la plataforma.
        </p>
      </div>
    </div>
  );
}

interface CardShellProps {
  children: React.ReactNode;
}

function CardShell({ children }: CardShellProps) {
  return (
    <div className="w-full max-w-sm">
      {/* Top glow — Kinetic Edge signature */}
      <div
        className="h-0.5 w-full rounded-t-3xl"
        style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
      />
      <div className="bg-surface-high rounded-b-3xl px-8 py-10 shadow-[0px_24px_48px_rgba(0,0,0,0.5)]">
        {children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AcceptInvitationPage() {
  const {
    tokenMissing,
    invitationDetails,
    isValidating,
    isValidationError,
    accept,
    isAccepting,
  } = useAcceptInvitation();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const landingURL = getLandingURL();

  const passwordsMatch = confirmPassword === "" || password === confirmPassword;
  const isInvalid = tokenMissing || isValidationError;

  // ── State A: Loading ────────────────────────────────────────────────────────
  if (!isInvalid && isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-low">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-body text-[0.875rem] text-on-surface-variant">
            Validando tu invitación...
          </p>
        </div>
      </div>
    );
  }

  // ── State B: Invalid / Expired ──────────────────────────────────────────────
  if (isInvalid) {
    return (
      <div className="min-h-screen flex bg-surface-low">
        <DecorativePanel />
        <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
          <CardShell>
            <div className="flex flex-col items-center text-center gap-4">
              <XCircle className="text-error-container" size={48} />
              <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
                Invitación inválida o expirada
              </h2>
              <p className="font-body text-[0.875rem] text-on-surface-variant">
                Este enlace de invitación no es válido o ya fue utilizado.
                Contacta al director de tu academia para recibir una nueva
                invitación.
              </p>
              <Link to="/login" className="mt-2 w-full">
                <Button
                  variant="tertiary"
                  className="w-full font-body text-[0.875rem] text-on-surface-variant hover:text-primary rounded-xl"
                >
                  Ir al inicio
                </Button>
              </Link>
            </div>
          </CardShell>
        </div>
      </div>
    );
  }

  // ── State C: Valid form ─────────────────────────────────────────────────────
  if (!invitationDetails) return null;

  const chip = getRoleChip(invitationDetails.role);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) return;
    accept({ fullName, password });
  }

  return (
    <div className="min-h-screen flex bg-surface-low">
      <DecorativePanel />

      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <CardShell>
          {/* Welcome header */}
          <div className="mb-8 flex flex-col gap-2">
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              INVITACIÓN A
            </span>
            <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
              {invitationDetails.academyName}
            </h2>
            <div>
              <span
                className={`font-body text-[0.6875rem] rounded-full px-3 py-1 ${chip.className}`}
              >
                {chip.label}
              </span>
            </div>
            <p className="font-body text-[0.875rem] text-on-surface-variant mt-1">
              Crea tu cuenta para acceder a la plataforma.
            </p>
          </div>

          {/* Email display (non-editable) */}
          <div className="bg-surface-highest rounded-xl px-4 py-3 mb-4">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-on-surface-variant shrink-0" />
              <span className="font-body text-[0.875rem] text-on-surface truncate">
                {invitationDetails.email}
              </span>
            </div>
            <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-1 pl-5">
              Este correo no puede modificarse
            </p>
          </div>

          {/* Linked player block — only shown if playerId is returned by the API */}
          {invitationDetails.playerId && (
            <div className="bg-surface-highest rounded-xl px-4 py-3 mb-4">
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mb-1">
                JUGADOR VINCULADO
              </p>
              <div className="flex items-center gap-2">
                <User size={14} className="text-on-surface-variant shrink-0" />
                <span className="font-body text-[0.875rem] text-on-surface">
                  Tu hijo/a será vinculado automáticamente a tu cuenta
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-6 mt-6"
          >
            {/* Full name */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="fullName"
                className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
              >
                Tu nombre completo
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Como aparecerá en la plataforma"
                autoComplete="name"
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
              >
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="font-body text-[0.875rem] text-error-container">
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            {/* CTA */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={isAccepting || !passwordsMatch}
            >
              {isAccepting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Crear cuenta y acceder"
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="font-body text-[0.6875rem] text-on-surface-variant text-center mt-6">
            Al crear tu cuenta aceptas los{" "}
            <a
              href={`${landingURL}/terminos`}
              target="_blank"
              className="text-primary hover:underline transition-colors"
            >
              Términos y Condiciones
            </a>{" "}
            de Cancha360.
          </p>
        </CardShell>
      </div>
    </div>
  );
}
