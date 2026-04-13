import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { usePlayers } from '@/hooks/usePlayers';
import { inviteUser } from '@/services/settings.service';
import type { InviteUserData } from '@/services/settings.service';

const SELECT_CLASS =
  'w-full bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary min-h-11 appearance-none cursor-pointer disabled:opacity-50';

function extractErrorMessage(error: unknown): string {
  if (error !== null && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}

// ── Form content ──────────────────────────────────────────────────────────────

interface FormContentProps {
  onSuccess: () => void;
  onClose: () => void;
}

function FormContent({ onSuccess, onClose }: FormContentProps) {
  const queryClient = useQueryClient();
  const { players } = usePlayers();
  const activePlayers = players.filter((p) => p.isActive);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'coach' | 'parent'>('coach');
  const [playerId, setPlayerId] = useState('');
  const [emailError, setEmailError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: InviteUserData) => inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ description: 'Invitación enviada correctamente' });
      onClose();
      onSuccess();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: extractErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  function handleRoleChange(newRole: 'coach' | 'parent') {
    setRole(newRole);
    if (newRole === 'coach') setPlayerId('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('El correo es requerido');
      return;
    }
    setEmailError('');

    const data: InviteUserData = { email: email.trim(), role };
    if (role === 'parent' && playerId) data.playerId = playerId;

    mutation.mutate(data);
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Correo electrónico <span className="text-error-container">*</span>
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
          }}
          placeholder="usuario@ejemplo.com"
          disabled={mutation.isPending}
          required
        />
        {emailError && (
          <p className="font-body text-xs text-error-container">{emailError}</p>
        )}
      </div>

      {/* Role */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-sm text-on-surface-variant">
          Rol <span className="text-error-container">*</span>
        </label>
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value as 'coach' | 'parent')}
          disabled={mutation.isPending}
          className={SELECT_CLASS}
        >
          <option value="coach">Entrenador</option>
          <option value="parent">Padre / Tutor</option>
        </select>
      </div>

      {/* Player link — only for parent */}
      {role === 'parent' && (
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm text-on-surface-variant">
            Vincular a un jugador (opcional)
          </label>
          <select
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            disabled={mutation.isPending}
            className={SELECT_CLASS}
          >
            <option value="">Sin vincular</option>
            {activePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-body font-semibold text-sm bg-linear-to-br from-primary to-secondary text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {mutation.isPending && <LoadingSpinner size="sm" />}
        Enviar invitación
      </button>
    </form>
  );
}

// ── Sheet / Dialog wrapper ────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function InviteUserSheet({ open, onOpenChange, onSuccess }: Props) {
  const isDesktop = useIsDesktop();
  const title = 'Invitar usuario';

  const content = (
    <FormContent
      key={String(open)}
      onSuccess={onSuccess}
      onClose={() => onOpenChange(false)}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-high border-0 rounded-3xl max-w-110 p-0 shadow-[0px_24px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="font-display text-xl font-semibold text-on-surface">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-surface-high border-0 rounded-t-3xl max-h-[95vh] overflow-y-auto p-0">
        <div className="h-0.5 bg-linear-to-r from-primary to-secondary" />
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="font-display text-xl font-semibold text-on-surface">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-5">{content}</div>
      </SheetContent>
    </Sheet>
  );
}
