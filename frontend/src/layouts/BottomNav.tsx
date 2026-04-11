import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getBottomNavItems } from '@/config/navigation';
import type { NavItemConfig } from '@/config/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// ---------------------------------------------------------------------------
// Single tab button — used for both primary tabs and overflow sheet items
// ---------------------------------------------------------------------------

interface TabButtonProps {
  item: NavItemConfig;
  isActive: boolean;
}

function TabButton({ item, isActive }: TabButtonProps) {
  return (
    <NavLink
      to={item.path}
      className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[48px] transition-colors"
    >
      <div className="relative flex items-center justify-center">
        <item.Icon
          size={22}
          strokeWidth={isActive ? 2.5 : 1.8}
          className={isActive ? 'text-primary' : 'text-on-surface-variant'}
        />
        {/* Active dot indicator */}
        {isActive && (
          <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
        )}
      </div>
      <span
        className={[
          'font-body text-[0.6875rem] leading-tight',
          isActive ? 'text-primary' : 'text-on-surface-variant',
        ].join(' ')}
      >
        {item.label}
      </span>
    </NavLink>
  );
}

// ---------------------------------------------------------------------------
// OverflowSheetItem — full-width row inside the "Más" sheet
// ---------------------------------------------------------------------------

interface OverflowItemProps {
  item: NavItemConfig;
  isActive: boolean;
  onClose: () => void;
}

function OverflowItem({ item, isActive, onClose }: OverflowItemProps) {
  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={[
        'flex items-center gap-4 px-6 py-4 rounded-xl transition-colors',
        isActive
          ? 'text-primary'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-highest',
      ].join(' ')}
    >
      <item.Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
      <span className="font-body text-[0.9375rem]">{item.label}</span>
    </NavLink>
  );
}

// ---------------------------------------------------------------------------
// BottomNav — visible only on mobile/tablet (flex lg:hidden)
// ---------------------------------------------------------------------------

export default function BottomNav() {
  const location = useLocation();
  const role = useAuthStore((state) => state.role);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!role) return null;

  const { primary, overflow } = getBottomNavItems(role);
  const hasOverflow = overflow.length > 0;

  // Is the current route one of the overflow items?
  const overflowIsActive = overflow.some((item) => item.path === location.pathname);

  return (
    <>
      {/* Bottom navigation bar */}
      <nav
        className={[
          'flex lg:hidden fixed bottom-0 left-0 right-0 z-50',
          'bg-surface-lowest shadow-[0px_-4px_24px_rgba(0,0,0,0.4)]',
          'h-16 sm:h-[72px]',
          'px-2',
        ].join(' ')}
        aria-label="Navegación principal"
      >
        {/* Primary tabs */}
        {primary.map((item) => (
          <TabButton
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
          />
        ))}

        {/* "Más" tab — only when there are overflow items */}
        {hasOverflow && (
          <button
            onClick={() => setSheetOpen(true)}
            className="flex flex-col items-center justify-center gap-1 flex-1 min-h-[48px] transition-colors cursor-pointer"
            aria-label="Más opciones"
          >
            <div className="relative flex items-center justify-center">
              <Menu
                size={22}
                strokeWidth={overflowIsActive ? 2.5 : 1.8}
                className={overflowIsActive ? 'text-primary' : 'text-on-surface-variant'}
              />
              {overflowIsActive && (
                <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
            <span
              className={[
                'font-body text-[0.6875rem] leading-tight',
                overflowIsActive ? 'text-primary' : 'text-on-surface-variant',
              ].join(' ')}
            >
              Más
            </span>
          </button>
        )}
      </nav>

      {/* Overflow sheet — slides up from the bottom */}
      {hasOverflow && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Más opciones</SheetTitle>
            </SheetHeader>

            <div className="px-3 pb-8 flex flex-col gap-1">
              {overflow.map((item) => (
                <OverflowItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  onClose={() => setSheetOpen(false)}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
