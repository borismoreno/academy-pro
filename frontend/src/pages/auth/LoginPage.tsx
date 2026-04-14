import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@/hooks/useLogin";
import type { Location } from "react-router-dom";

interface LocationState {
  from?: Location;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Recover the path the user tried to visit before being redirected to login
  const location = useLocation();
  const fromPath = (location.state as LocationState | null)?.from?.pathname;

  const { login, isPending, errorMessage } = useLogin({
    redirectAfterLogin: fromPath,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (errorMessage) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: errorMessage,
      });
    }
  }, [errorMessage, toast]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    login({ email, password });
  }

  return (
    <div className="min-h-screen flex bg-surface-low">
      {/* Left decorative panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-lowest relative overflow-hidden flex-col items-center justify-center p-16">
        {/* Background gradient accent */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, #bcf521 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #00f4fe 0%, transparent 60%)",
          }}
        />

        {/* Decorative large circle */}
        <div
          className="absolute -bottom-32 -right-32 w-125 h-125 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
        />
        <div
          className="absolute -top-24 -left-24 w-75 h-75 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #00f4fe, #bcf521)" }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-md">
          {/* Logo / brand mark */}
          <div className="mb-8">
            <span className="font-display text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              Cancha360
            </span>
          </div>

          <h1 className="font-display text-[3.5rem] font-bold text-on-surface leading-[1.1] mb-6">
            Gestiona tu
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
            con precisión.
          </h1>

          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            La plataforma todo-en-uno para academias de fútbol. Jugadores,
            asistencia, evaluaciones y más.
          </p>

          {/* Stat chips */}
          <div className="mt-10 flex gap-4 flex-wrap">
            {[
              { label: "Equipos", value: "100+" },
              { label: "Jugadores", value: "2.5K+" },
              { label: "Academias", value: "30+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-high rounded-3xl px-5 py-3"
              >
                <div className="font-display text-[1.75rem] font-semibold text-primary leading-none">
                  {stat.value}
                </div>
                <div className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        {/* Form card */}
        <div className="w-full max-w-sm">
          {/* Top glow */}
          <div
            className="h-0.5 w-full rounded-t-3xl"
            style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
          />

          <div className="bg-surface-high rounded-b-3xl px-8 py-10 shadow-[0px_24px_48px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="mb-8">
              {/* Mobile brand */}
              <span className="lg:hidden font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant block mb-4">
                Cancha360
              </span>

              <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
                Bienvenido
              </h2>
              <p className="font-body text-sm text-on-surface-variant mt-1">
                Inicia sesión para continuar
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-6"
            >
              {/* Email field */}
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

              {/* Password field */}
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
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
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

                {/* Forgot password */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Olvidé mi contraseña
                  </Link>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>

            {/* Link to contact */}
            <p className="font-body text-sm text-on-surface-variant text-center mt-6">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline transition-colors"
              >
                Solicitar acceso
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
