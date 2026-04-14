import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Mail, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";

interface LocationState {
  email?: string;
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get("token");
  const state = location.state as LocationState | null;
  const email = state?.email ?? "";

  const { verifyEmailQuery, resendVerificationMutation } =
    useVerifyEmail(token);

  // Countdown state for resend cooldown
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleResend() {
    if (!email || countdown > 0) return;
    resendVerificationMutation.mutate(email);
    setCountdown(60);
  }

  // —— Scenario A: token in URL ——
  if (token) {
    return (
      <div className="min-h-screen bg-surface-low flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Top glow */}
          <div
            className="h-0.5 w-full rounded-t-3xl"
            style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
          />

          <div className="bg-surface-high rounded-b-3xl px-8 py-12 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-6">
            <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant self-start">
              Cancha360
            </span>

            {verifyEmailQuery.isPending && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div>
                  <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
                    Verificando tu correo...
                  </h2>
                  <p className="font-body text-sm text-on-surface-variant mt-2">
                    Por favor espera un momento.
                  </p>
                </div>
              </>
            )}

            {verifyEmailQuery.isSuccess && (
              <>
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <div>
                  <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
                    ¡Correo verificado!
                  </h2>
                  <p className="font-body text-sm text-on-surface-variant mt-2">
                    Correo verificado. Redirigiendo al login...
                  </p>
                </div>
              </>
            )}

            {verifyEmailQuery.isError && (
              <>
                <XCircle className="h-12 w-12 text-error-container" />
                <div>
                  <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
                    Error de verificación
                  </h2>
                  <p className="font-body text-sm text-on-surface-variant mt-2">
                    {verifyEmailQuery.error instanceof Error
                      ? verifyEmailQuery.error.message
                      : "No se pudo verificar el correo. El enlace puede haber expirado."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // —— Scenario B: no token — post-registration info screen ——
  return (
    <div className="min-h-screen bg-surface-low flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Top glow */}
        <div
          className="h-0.5 w-full rounded-t-3xl"
          style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
        />

        <div className="bg-surface-high rounded-b-3xl px-8 py-12 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-6">
          <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant self-start">
            Cancha360
          </span>

          {/* Mail icon with gradient glow */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-30"
              style={{
                background: "linear-gradient(135deg, #bcf521, #00f4fe)",
              }}
            />
            <div className="relative bg-surface-highest rounded-full p-5">
              <Mail className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div>
            <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
              Revisa tu correo electrónico
            </h2>
            <p className="font-body text-sm text-on-surface-variant mt-3 leading-relaxed">
              Te enviamos un enlace de verificación a{" "}
              <span className="text-on-surface font-medium">
                {email || "tu correo"}
              </span>
              . Revisa tu bandeja de entrada y haz clic en el enlace para
              activar tu cuenta.
            </p>
          </div>

          {/* Resend button */}
          <Button
            type="button"
            variant="tertiary"
            size="lg"
            className="w-full bg-transparent text-on-surface-variant hover:text-primary rounded-xl"
            onClick={handleResend}
            disabled={countdown > 0 || resendVerificationMutation.isPending}
          >
            {resendVerificationMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : countdown > 0 ? (
              `Reenviar en ${countdown}s`
            ) : (
              "Reenviar correo"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
