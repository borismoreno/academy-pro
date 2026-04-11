import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { ApiResponse } from '@/types';

interface UnreadCountData {
  count: number;
}

export function useNotificationCount() {
  const { data, isLoading } = useQuery<ApiResponse<UnreadCountData>>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<UnreadCountData>>('/notifications/unread-count');
      return response.data;
    },
    refetchInterval: 60000,
  });

  return {
    count: data?.data?.count ?? 0,
    isLoading,
  };
}
