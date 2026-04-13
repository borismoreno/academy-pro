import { Bell, ClipboardList, BarChart2 } from 'lucide-react';
import type { Notification } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface NotificationRowProps {
  notification: Notification;
}

function getIconConfig(title: string): {
  icon: React.ReactNode;
  bgClass: string;
} {
  const lower = title.toLowerCase();

  if (lower.includes('asistencia') || lower.includes('sesión')) {
    return {
      icon: <ClipboardList size={20} />,
      bgClass: 'bg-secondary/20 text-secondary',
    };
  }

  if (lower.includes('evaluación')) {
    return {
      icon: <BarChart2 size={20} />,
      bgClass: 'bg-primary/20 text-primary',
    };
  }

  return {
    icon: <Bell size={20} />,
    bgClass: 'bg-surface-lowest text-on-surface-variant',
  };
}

export default function NotificationRow({ notification }: NotificationRowProps) {
  const { icon, bgClass } = getIconConfig(notification.title);
  const isUnread = !notification.isRead;

  return (
    <div
      className={[
        'flex items-start gap-4 px-4 py-4 rounded-xl min-h-[64px] transition-all duration-300',
        isUnread
          ? 'bg-surface-high border-l-[3px] border-primary'
          : 'bg-surface-highest border-l-[3px] border-transparent',
      ].join(' ')}
    >
      {/* Icon circle */}
      <div
        className={`flex-shrink-0 rounded-full flex items-center justify-center ${bgClass}`}
        style={{ width: 40, height: 40 }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-body text-[0.875rem] font-medium leading-snug ${
            isUnread ? 'text-on-surface' : 'text-on-surface-variant'
          }`}
        >
          {notification.title}
        </p>
        <p className="font-body text-[0.875rem] text-on-surface-variant line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      <div className="flex-shrink-0 pt-1">
        {isUnread && (
          <span className="block w-2 h-2 rounded-full bg-primary" />
        )}
      </div>
    </div>
  );
}
