import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import NotificationRow from "@/pages/notifications/components/NotificationRow";
import type { Notification } from "@/types";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import { useQueryClient } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// PanelContent — shared inner content for both Popover and Sheet
// ---------------------------------------------------------------------------

interface PanelContentProps {
  notifications: Notification[];
  isLoading: boolean;
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  listClassName: string;
}

function PanelContent({
  notifications,
  isLoading,
  unreadCount,
  onMarkAllAsRead,
  onClose,
  listClassName,
}: PanelContentProps) {
  const navigate = useNavigate();

  const limited = [...notifications]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 15);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/15">
        <span className="font-display text-[1.1rem] font-semibold text-on-surface">
          Notificaciones
        </span>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="font-body text-xs text-primary hover:opacity-80 transition-opacity cursor-pointer"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className={listClassName}>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
        {!isLoading && limited.length === 0 && (
          <EmptyState
            icon={<Bell size={32} />}
            message="No tienes notificaciones."
          />
        )}
        {!isLoading && limited.length > 0 && (
          <div className="flex flex-col gap-2 p-3">
            {limited.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-outline-variant/15 px-5 py-3 flex items-center justify-center">
        <button
          onClick={() => {
            navigate("/notifications");
            onClose();
          }}
          className="font-body text-sm font-medium text-primary hover:opacity-80 transition-opacity cursor-pointer"
        >
          Ver historial completo
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// BellTrigger — bell icon button with unread badge
// ---------------------------------------------------------------------------

interface BellTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  unreadCount: number;
}

const BellTrigger = forwardRef<HTMLButtonElement, BellTriggerProps>(
  ({ unreadCount, ...props }, ref) => (
    <button
      ref={ref}
      className="relative p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-highest transition-colors cursor-pointer"
      aria-label="Notificaciones"
      {...props}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-primary text-on-primary rounded-full font-body text-[0.625rem] font-semibold flex items-center justify-center leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  ),
);
BellTrigger.displayName = "BellTrigger";

// ---------------------------------------------------------------------------
// NotificationPanel — Popover on desktop, Sheet on mobile
// ---------------------------------------------------------------------------

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const isMobile = window.innerWidth < 1024;
  const hasMarkedRef = useRef(false);
  const queryClient = useQueryClient();

  const { notifications, isLoading, markAllAsReadMutation } =
    useNotifications();
  const { count: unreadCount } = useNotificationCount();

  // Auto mark-all-as-read when panel opens (reset on close so it fires again next open)
  useEffect(() => {
    if (open) {
      if (!hasMarkedRef.current) {
        hasMarkedRef.current = true;
        markAllAsReadMutation.mutate();
      }
      // Invalidate portal queries so parent portal refreshes
      // This is a no-op for non-parent roles since these queries don't exist
      queryClient.invalidateQueries({ queryKey: ["portal-player"] });
      queryClient.invalidateQueries({ queryKey: ["portal-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["portal-progress"] });
      queryClient.invalidateQueries({ queryKey: ["my-players"] });
    } else {
      hasMarkedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleMarkAllAsRead() {
    markAllAsReadMutation.mutate();
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <BellTrigger unreadCount={unreadCount} />
        </SheetTrigger>
        <SheetContent className="max-h-[80vh] overflow-hidden p-0">
          <PanelContent
            notifications={notifications}
            isLoading={isLoading}
            unreadCount={unreadCount}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClose={() => setOpen(false)}
            listClassName="overflow-y-auto max-h-[60vh]"
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <BellTrigger unreadCount={unreadCount} />
      </PopoverTrigger>
      <PopoverContent>
        <PanelContent
          notifications={notifications}
          isLoading={isLoading}
          unreadCount={unreadCount}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={() => setOpen(false)}
          listClassName="overflow-y-auto max-h-[400px]"
        />
      </PopoverContent>
    </Popover>
  );
}
