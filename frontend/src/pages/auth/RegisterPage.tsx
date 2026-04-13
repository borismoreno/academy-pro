import { Link } from "react-router-dom";
import { MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
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
        <div
          className="absolute -bottom-32 -right-32 w-125 h-[500px] rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
        />
        <div
          className="absolute -top-24 -left-24 w-75 h-[300px] rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #00f4fe, #bcf521)" }}
        />

        <div className="relative z-10 max-w-md">
          <div className="mb-8">
            <span className="font-display text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              AcademyPro
            </span>
          </div>

          <h1 className="font-display text-[3.5rem] font-bold text-on-surface leading-[1.1] mb-6">
            Tu academia,
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #bcf521, #00f4fe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              al siguiente
            </span>
            <br />
            nivel.
          </h1>

          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            La plataforma todo-en-uno para academias de fútbol. Jugadores,
            asistencia, evaluaciones y más.
          </p>

          <div className="mt-10 flex gap-4 flex-wrap">
            {[
              { label: "Equipos", value: "100+" },
              { label: "Jugadores", value: "2.5K+" },
              { label: "Academias", value: "30+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-high rounded-3xl px-5 py-3">
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

      {/* Right side — contact card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-sm">
          {/* Top glow */}
          <div
            className="h-0.5 w-full rounded-t-3xl"
            style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
          />

          <div className="bg-surface-high rounded-b-3xl px-8 py-10 shadow-[0px_24px_48px_rgba(0,0,0,0.5)]">
            {/* Mobile brand */}
            <span className="lg:hidden font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant block mb-4">
              AcademyPro
            </span>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <MessageSquare
                size={48}
                className="text-primary"
                strokeWidth={1.5}
              />
            </div>

            {/* Headline */}
            <h2 className="font-display text-[1.75rem] font-semibold text-on-surface text-center mb-3">
              Solicita acceso a AcademyPro
            </h2>

            {/* Body */}
            <p className="font-body text-sm text-on-surface-variant text-center mb-8 leading-relaxed">
              AcademyPro está disponible por invitación. Contáctanos y te
              agregaremos a la plataforma.
            </p>

            <div className="flex flex-col gap-3">
              {/* WhatsApp button */}
              <a
                href="https://wa.me/593000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-11"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full gap-2"
                  asChild={false}
                >
                  <MessageSquare size={18} />
                  Contactar por WhatsApp
                </Button>
              </a>

              {/* Email button */}
              <a
                href="mailto:marketing@cancha360.com"
                className="min-h-11"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full gap-2"
                  asChild={false}
                >
                  <Mail size={18} />
                  Escribirnos por correo
                </Button>
              </a>
            </div>

            <p className="font-body text-sm text-on-surface-variant text-center mt-6">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline transition-colors"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
