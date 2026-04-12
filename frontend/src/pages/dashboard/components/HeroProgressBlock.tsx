import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PulseMonitorSvg() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 280 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <filter id="glow-primary" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="glow-secondary"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="line-gradient-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00f4fe" />
          <stop offset="100%" stopColor="#bcf521" />
        </linearGradient>
        <linearGradient id="fill-gradient-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bcf521" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#bcf521" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fill-gradient-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00f4fe" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#00f4fe" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Line 1 — primary ascending, strong */}
      <path
        d="M10,130 C40,120 60,100 90,85 C120,70 140,55 170,42 C200,29 230,18 270,10"
        stroke="url(#line-gradient-1)"
        strokeWidth="2.5"
        fill="none"
        filter="url(#glow-primary)"
      />
      <path
        d="M10,130 C40,120 60,100 90,85 C120,70 140,55 170,42 C200,29 230,18 270,10 L270,160 L10,160 Z"
        fill="url(#fill-gradient-1)"
      />

      {/* Line 2 — secondary, slightly offset */}
      <path
        d="M10,145 C50,135 80,118 110,102 C140,86 170,72 210,55 C240,42 260,30 270,22"
        stroke="#00f4fe"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
        filter="url(#glow-secondary)"
      />
      <path
        d="M10,145 C50,135 80,118 110,102 C140,86 170,72 210,55 C240,42 260,30 270,22 L270,160 L10,160 Z"
        fill="url(#fill-gradient-2)"
      />

      {/* Line 3 — muted tertiary */}
      <path
        d="M10,155 C60,148 100,136 140,120 C175,106 210,88 270,68"
        stroke="#bcf521"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />

      {/* Dot marker at the top of line 1 */}
      <circle
        cx="270"
        cy="10"
        r="4"
        fill="#bcf521"
        filter="url(#glow-primary)"
      />
      <circle cx="270" cy="10" r="7" fill="#bcf521" opacity="0.2" />
    </svg>
  );
}

export default function HeroProgressBlock() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-high rounded-3xl overflow-hidden">
      {/* Top glow gradient line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary to-secondary" />

      {/* p-5 on mobile, p-8 on desktop */}
      <div className="p-5 lg:p-8 flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
        {/* Left side */}
        <div className="w-full lg:flex-1 lg:basis-[60%] space-y-3 lg:space-y-4">
          <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
            PROGRESO DE TUS JUGADORES
          </p>

          {/* headline-md on mobile, display-lg on desktop */}
          <h2 className="font-display text-[1.75rem] lg:text-[3.5rem] font-bold text-on-surface leading-tight">
            Ve cómo están mejorando tus jugadores
          </h2>

          {/* Description hidden on mobile — headline + CTA are enough */}
          <p className="hidden lg:block font-body text-[0.875rem] text-on-surface-variant max-w-md">
            Consulta el historial de evaluaciones y el avance de cada jugador en
            tiempo real.
          </p>

          {/* CTA — full width on mobile, auto on desktop */}
          <button
            onClick={() => navigate("/evaluations")}
            className="w-full lg:w-auto inline-flex items-center justify-center lg:justify-start gap-2 min-h-11 px-6 py-3 bg-gradient-to-br from-primary to-secondary text-on-primary font-semibold rounded-xl transition-opacity hover:opacity-90"
          >
            Ver evaluaciones
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Right side — decorative sparkline, hidden on mobile */}
        <div className="hidden lg:flex lg:basis-[40%] lg:max-w-[320px] h-48 items-center justify-center">
          <PulseMonitorSvg />
        </div>
      </div>
    </div>
  );
}
