import { useState } from 'react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { useProfile } from '@/hooks/useProfile';
import ChangePasswordForm from './ChangePasswordForm';

export default function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const { updateProfileMutation } = useProfile();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [nameError, setNameError] = useState('');

  const isPending = updateProfileMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    setNameError('');
    updateProfileMutation.mutate({ fullName: fullName.trim() });
  }

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-display text-[1.75rem] font-semibold text-on-surface">Mi perfil</h2>

      {/* Sub-section A — Personal info */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm text-on-surface-variant">
            Nombre completo <span className="text-error-container">*</span>
          </label>
          <Input
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (nameError) setNameError('');
            }}
            disabled={isPending}
            placeholder="Tu nombre completo"
          />
          {nameError && (
            <p className="font-body text-xs text-error-container">{nameError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm text-on-surface-variant">
            Correo electrónico
          </label>
          <Input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="opacity-50 cursor-not-allowed"
          />
          <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
            El correo electrónico no puede modificarse.
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 h-11 px-6 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isPending && <LoadingSpinner size="sm" />}
            Guardar cambios
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="h-px bg-surface-highest" />

      {/* Sub-section B — Change password */}
      <ChangePasswordForm />
    </div>
  );
}
