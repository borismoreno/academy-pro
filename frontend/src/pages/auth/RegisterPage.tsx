import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/hooks/useRegister';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const { register, isPending } = useRegister();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    register({ fullName, email, password, academyName });
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
              'radial-gradient(ellipse at 30% 50%, #bcf521 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #00f4fe 0%, transparent 60%)',
          }}
        />

        {/* Decorative circles */}
        <div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: 'linear-gradient(135deg, #bcf521, #00f4fe)' }}
        />
        <div
          className="absolute -top-24 -left-24 w-[300px] h-[300px] rounded-full opacity-5"
          style={{ background: 'linear-gradient(135deg, #00f4fe, #bcf521)' }}
        />

        {/* Content */}
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
                background: 'linear-gradient(135deg, #bcf521, #00f4fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              al siguiente
            </span>
            <br />
            nivel.
          </h1>

          <p className="font-body text-[0.875rem] text-on-surface-variant leading-relaxed">
            Crea tu cuenta en minutos y empieza a gestionar jugadores,
            asistencia y evaluaciones desde el primer día.
          </p>

          {/* Stat chips */}
          <div className="mt-10 flex gap-4 flex-wrap">
            {[
              { label: 'Equipos', value: '100+' },
              { label: 'Jugadores', value: '2.5K+' },
              { label: 'Academias', value: '30+' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-high rounded-[1.5rem] px-5 py-3"
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
        <div className="w-full max-w-sm">
          {/* Top glow */}
          <div
            className="h-[2px] w-full rounded-t-[1.5rem]"
            style={{ background: 'linear-gradient(135deg, #bcf521, #00f4fe)' }}
          />

          <div className="bg-surface-high rounded-b-[1.5rem] px-8 py-10 shadow-[0px_24px_48px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="mb-8">
              <span className="lg:hidden font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant block mb-4">
                AcademyPro
              </span>
              <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">
                Crear cuenta
              </h2>
              <p className="font-body text-[0.875rem] text-on-surface-variant mt-1">
                Únete a AcademyPro hoy
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {/* Full name */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="fullName"
                  className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
                >
                  Nombre completo
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan García"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
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

              {/* Academy name */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="academyName"
                  className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
                >
                  Nombre de la academia
                </label>
                <Input
                  id="academyName"
                  type="text"
                  placeholder="Academia Fútbol Ecuador"
                  autoComplete="organization"
                  required
                  minLength={2}
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
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
                    type={showPassword ? 'text' : 'password'}
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
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordMismatch) setPasswordMismatch(false);
                    }}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="font-body text-[0.75rem] text-error-container">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              {/* Submit */}
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
                  'Crear cuenta'
                )}
              </Button>
            </form>

            {/* Link to login */}
            <p className="font-body text-[0.875rem] text-on-surface-variant text-center mt-6">
              ¿Ya tienes una cuenta?{' '}
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
