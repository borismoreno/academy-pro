import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { KeyRound, MailCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/hooks/useForgotPassword";

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
          Recupera tu
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #bcf521, #00f4fe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            acceso
          </span>
          <br />
          fácilmente.
        </h1>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          Te enviaremos un enlace seguro para que puedas crear una nueva
          contraseña.
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

// ─── STATE A — Form ────────────────────────────────────────────────────────────

interface FormStateProps {
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}

function FormState({ email, setEmail, onSubmit, isPending }: FormStateProps) {
  return (
    <>
      <div className="mb-2">
        <Link
          to="/login"
          className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          ← Iniciar sesión
        </Link>
      </div>

      <div className="flex flex-col items-start gap-4 mb-8 mt-6">
        <KeyRound className="text-primary" style={{ width: 40, height: 40 }} />
        <div>
          <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
          >
            Correo electrónico
          </label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Enviar enlace"
          )}
        </Button>
      </form>
    </>
  );
}

// ─── STATE B — Confirmation ────────────────────────────────────────────────────

interface ConfirmationStateProps {
  email: string;
  onResend: () => void;
  isResending: boolean;
}

function ConfirmationState({
  email,
  onResend,
  isResending,
}: ConfirmationStateProps) {
  const COOLDOWN_SECONDS = 60;
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS);
  }

  useEffect(() => {
    if (cooldown <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cooldown]);

  function handleResend() {
    onResend();
    startCooldown();
  }

  // Expose the email to the parent so it can call with the same email
  void email;

  return (
    <div className="flex flex-col items-center text-center gap-4">
      <MailCheck
        className="text-primary mb-2"
        style={{ width: 48, height: 48 }}
      />

      <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
        Revisa tu correo
      </h2>

      <p className="font-body text-sm text-on-surface-variant">
        Si el correo está registrado en nuestra plataforma, recibirás un enlace
        para restablecer tu contraseña en los próximos minutos.
      </p>

      <span className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
        Revisa también tu carpeta de spam.
      </span>

      <div className="flex flex-col gap-3 w-full mt-4">
        <Link to="/login">
          <Button variant="tertiary" size="lg" className="w-full">
            Volver al inicio
          </Button>
        </Link>

        <Button
          variant="tertiary"
          size="lg"
          className="w-full"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
        >
          {isResending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : cooldown > 0 ? (
            `Reenviar en ${cooldown}s`
          ) : (
            "Reenviar correo"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
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

  const [email, setEmail] = useState("");
  const { sent, submit, isPending } = useForgotPassword();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(email);
  }

  function handleResend() {
    submit(email);
  }

  return (
    <div className="flex bg-surface-low" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      <DecorativePanel />

      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <CardWithGlow>
          {sent ? (
            <ConfirmationState
              email={email}
              onResend={handleResend}
              isResending={isPending}
            />
          ) : (
            <FormState
              email={email}
              setEmail={setEmail}
              onSubmit={handleSubmit}
              isPending={isPending}
            />
          )}
        </CardWithGlow>
      </div>
    </div>
  );
}
