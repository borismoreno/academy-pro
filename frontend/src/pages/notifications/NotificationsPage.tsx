import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";
import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import NotificationRow from "./components/NotificationRow";
import type { Notification } from "@/types";

type Tab = "all" | "unread";

function getDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const toDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const diff = toDay(now) - toDay(date);
  const ONE_DAY = 86400000;

  if (diff === 0) return "Hoy";
  if (diff === ONE_DAY) return "Ayer";

  return date.toLocaleDateString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupByDate(
  notifications: Notification[],
): { label: string; items: Notification[] }[] {
  const map = new Map<string, Notification[]>();

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  for (const n of sorted) {
    const label = getDateLabel(n.createdAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(n);
  }

  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const hasMarkedRef = useRef(false);

  const {
    notifications,
    isLoading,
    isError,
    unreadCount,
    markAllAsReadMutation,
  } = useNotifications(activeTab === "unread");

  // Auto mark-all-as-read on mount once if there are unread notifications
  useEffect(() => {
    if (hasMarkedRef.current) return;
    if (unreadCount > 0) {
      hasMarkedRef.current = true;
      markAllAsReadMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount]);

  function handleMarkAllAsRead() {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          description: "Todas las notificaciones fueron marcadas como leídas",
        });
      },
    });
  }

  const hasUnread = notifications.some((n) => !n.isRead);
  const groups = groupByDate(notifications);

  const markAllButton = hasUnread ? (
    <button
      onClick={handleMarkAllAsRead}
      disabled={markAllAsReadMutation.isPending}
      className="flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl bg-transparent font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
    >
      <CheckCheck size={16} />
      Marcar todas como leídas
    </button>
  ) : null;

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-2xl mx-auto">
      <PageHeader title="Notificaciones" action={markAllButton} />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={[
            "min-h-11 px-4 py-2 rounded-xl font-body text-sm transition-all",
            activeTab === "all"
              ? "bg-linear-to-br from-primary to-secondary text-on-primary font-medium"
              : "bg-surface-highest text-on-surface-variant",
          ].join(" ")}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={[
            "min-h-11 px-4 py-2 rounded-xl font-body text-sm transition-all",
            activeTab === "unread"
              ? "bg-linear-to-br from-primary to-secondary text-on-primary font-medium"
              : "bg-surface-highest text-on-surface-variant",
          ].join(" ")}
        >
          No leídas
        </button>
      </div>

      {/* Content */}
      {isLoading && <LoadingSpinner />}

      {!isLoading && isError && (
        <EmptyState
          message="No se pudieron cargar las notificaciones."
          icon={<Bell size={48} />}
        />
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState
          icon={<Bell size={48} />}
          message={
            activeTab === "unread"
              ? "No tienes notificaciones sin leer."
              : "No tienes notificaciones."
          }
        />
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <div className="flex flex-col gap-3">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant py-2">
                {label}
              </p>
              <div className="flex flex-col gap-3">
                {items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
