import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useProfile } from '@/hooks/useProfile';

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled: boolean;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-sm text-on-surface-variant">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex h-11 w-full rounded-xl bg-surface-low px-4 py-2 pr-12 font-body text-sm text-on-surface border border-outline-variant/15 placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="font-body text-xs text-error-container">{error}</p>}
    </div>
  );
}

export default function ChangePasswordForm() {
  const { changePasswordMutation } = useProfile();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const isPending = changePasswordMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden');
      return;
    }
    setConfirmError('');

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <h3 className="font-display text-[1.2rem] font-semibold text-on-surface">
        Cambiar contraseña
      </h3>

      <PasswordInput
        label="Contraseña actual"
        value={currentPassword}
        onChange={setCurrentPassword}
        placeholder="Contraseña actual"
        disabled={isPending}
      />

      <PasswordInput
        label="Nueva contraseña"
        value={newPassword}
        onChange={setNewPassword}
        placeholder="Mínimo 8 caracteres"
        disabled={isPending}
      />

      <PasswordInput
        label="Confirmar nueva contraseña"
        value={confirmPassword}
        onChange={(v) => {
          setConfirmPassword(v);
          if (confirmError) setConfirmError('');
        }}
        placeholder="Repite la nueva contraseña"
        disabled={isPending}
        error={confirmError}
      />

      <div>
        <button
          type="submit"
          disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
          className="flex items-center gap-2 h-11 px-6 rounded-xl font-body font-semibold text-sm bg-surface-highest text-primary transition-opacity hover:opacity-80 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isPending && <LoadingSpinner size="sm" />}
          Cambiar contraseña
        </button>
      </div>
    </form>
  );
}
