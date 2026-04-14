import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/hooks/useResetPassword";

// ─── Shared decorative left panel ─────────────────────────────────────────────

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
          Nueva
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #bcf521, #00f4fe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            contraseña
          </span>
          <br />
          segura.
        </h1>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          Crea una contraseña fuerte para proteger tu cuenta de Cancha360.
        </p>
      </div>
    </div>
  );
}

// ─── Top glow card wrapper ─────────────────────────────────────────────────────

function CardWithGlow({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm">
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

// ─── Error state ───────────────────────────────────────────────────────────────

function ErrorState() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <XCircle
        className="text-error-container mb-2"
        style={{ width: 48, height: 48 }}
      />
      <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
        Enlace inválido o expirado
      </h2>
      <p className="font-body text-sm text-on-surface-variant">
        Este enlace ya fue utilizado o ha expirado. Solicita uno nuevo.
      </p>
      <Link to="/forgot-password" className="w-full mt-4">
        <Button variant="primary" size="lg" className="w-full">
          Solicitar nuevo enlace
        </Button>
      </Link>
    </div>
  );
}

// ─── Success state ─────────────────────────────────────────────────────────────

function SuccessState() {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <CheckCircle
        className="text-primary mb-2"
        style={{ width: 48, height: 48 }}
      />
      <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
        ¡Contraseña restablecida!
      </h2>
      <p className="font-body text-sm text-on-surface-variant">
        Redirigiendo al inicio de sesión...
      </p>
      <Loader2 className="h-5 w-5 animate-spin text-on-surface-variant mt-2" />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  useEffect(() => {
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.setAttribute('content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, interactive-widget=resizes-content'
      )
    }
    return () => {
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0')
      }
    }
  }, [])

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const { submit, isPending, isSuccess, isError } = useResetPassword();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setConfirmError("Las contraseñas no coinciden");
      return;
    }

    setConfirmError("");
    submit(password);
  }

  return (
    <div className="flex bg-surface-low" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      <DecorativePanel />

      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <CardWithGlow>
          {isSuccess ? (
            <SuccessState />
          ) : isError ? (
            <ErrorState />
          ) : (
            <>
              <div className="flex flex-col items-start gap-4 mb-8">
                <LockKeyhole
                  className="text-primary"
                  style={{ width: 40, height: 40 }}
                />
                <div>
                  <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
                    Nueva contraseña
                  </h2>
                  <p className="font-body text-sm text-on-surface-variant mt-1">
                    Ingresa tu nueva contraseña. Debe tener al menos 8
                    caracteres.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-6"
              >
                {/* Nueva contraseña */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
                  >
                    Nueva contraseña
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
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
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

                {/* Confirmar contraseña */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="confirm-password"
                    className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
                  >
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmError) setConfirmError("");
                      }}
                      className="pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      aria-label={
                        showConfirm
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmError && (
                    <p className="font-body text-[0.75rem] text-error-container">
                      {confirmError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Restablecer contraseña"
                  )}
                </Button>
              </form>
            </>
          )}
        </CardWithGlow>
      </div>
    </div>
  );
}
