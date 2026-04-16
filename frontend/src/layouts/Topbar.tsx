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

interface TopbarProps {
  pageTitle: string;
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function Topbar({ pageTitle }: TopbarProps) {
  const user = useAuthStore((state) => state.user);
  const { logout } = useLogout();

  const initials = user ? getInitials(user.fullName) : '?';

  return (
    <header className="sticky top-0 z-10 h-16 bg-surface-high/70 backdrop-blur-[20px] flex items-center justify-between px-8">
      {/* Left: page title */}
      <h1 className="font-display text-[1.75rem] font-semibold text-on-surface leading-none">
        {pageTitle}
      </h1>

      {/* Right: notification bell + avatar */}
      <div className="flex items-center gap-4">
        {/* Notification panel (Popover on desktop, Sheet on mobile) */}
        <NotificationPanel />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-9 h-9 rounded-full bg-surface-high flex items-center justify-center hover:bg-surface-highest transition-colors cursor-pointer focus:outline-none"
              aria-label="Menú de usuario"
            >
              <span className="font-display text-xs font-bold text-primary">{initials}</span>
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
