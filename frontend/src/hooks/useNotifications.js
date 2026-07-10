import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationApi } from '../services';
import { getErrorMessage } from '../services/api';
import useNotificationStore from '../store/notificationStore';

export default function useNotifications() {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const listQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getAll,
  });

  useEffect(() => {
    if (listQuery.data) {
      const items = Array.isArray(listQuery.data) ? listQuery.data : listQuery.data?.notifications || [];
      setUnreadCount(items.filter((n) => !n.read).length);
    }
  }, [listQuery.data, setUnreadCount]);

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return { listQuery, markReadMutation, markAllReadMutation };
}
