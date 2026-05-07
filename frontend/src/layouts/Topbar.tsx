import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useLogout';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';

interface TopbarProps {
  pageTitle: string;
}

export default function Topbar({ pageTitle }: TopbarProps) {
  const user = useAuthStore((state) => state.user);
  const { logout } = useLogout();
  const location = useLocation();

  const initials = user ? getInitials(user.fullName) : '?';
  const isDashboard = location.pathname === '/dashboard';
  const firstName = user?.fullName.split(' ')[0] ?? '';

  return (
    <header className="sticky top-0 z-10 h-16 bg-surface-high/70 backdrop-blur-[20px] flex items-center justify-between px-6 lg:px-8">
      {isDashboard ? (
        <div className="flex flex-col gap-0">
          <span className="font-body text-[10px] uppercase tracking-[0.08em] text-on-surface-variant">
            Bienvenido de vuelta
          </span>
          <span className="font-display text-[18px] font-bold text-on-surface leading-tight">
            {firstName} 👋
          </span>
        </div>
      ) : (
        <h1 className="font-display text-[1.75rem] font-semibold text-on-surface leading-none">
          {pageTitle}
        </h1>
      )}

      <div className="flex items-center gap-3">
        <NotificationPanel />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-[38px] h-[38px] rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center font-display text-[13px] font-bold text-on-primary cursor-pointer focus:outline-none"
              aria-label="Menú de usuario"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-body text-sm font-medium text-on-surface px-3 py-2">
              {user?.fullName ?? '—'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-on-surface-variant hover:text-primary">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
