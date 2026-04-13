import api from '@/services/api';
import type { ApiResponse, Notification } from '@/types';

const BASE = '/notifications';

export async function getNotifications(unreadOnly?: boolean): Promise<Notification[]> {
  const params = unreadOnly ? { unreadOnly: 'true' } : {};
  const response = await api.get<ApiResponse<Notification[]>>(BASE, { params });
  return response.data.data;
}

export async function markAsRead(id: string): Promise<Notification> {
  const response = await api.patch<ApiResponse<Notification>>(`${BASE}/${id}/read`);
  return response.data.data;
}

export async function markAllAsRead(): Promise<void> {
  await api.patch<ApiResponse<null>>(`${BASE}/read-all`);
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get<ApiResponse<{ count: number }>>(`${BASE}/unread-count`);
  return response.data.data.count;
}
