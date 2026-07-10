import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import socket from '../socket';
import useAuthStore from '../store/authStore';

export default function useSocket() {
  const queryClient = useQueryClient();
  const { user, accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socket.disconnect();
      return undefined;
    }

    socket.auth = { token: accessToken };
    socket.connect();

    socket.emit('join:room', { userId: user?.id || user?._id, role: user?.role });

    const events = [
      'complaint:new',
      'complaint:assigned',
      'complaint:updated',
      'complaint:completed',
      'complaint:closed',
      'worker:created',
      'worker:updated',
      'worker:deleted',
    ];

    const handler = (payload) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['my-complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      toast(payload?.message || 'Update received');
    };

    events.forEach((event) => socket.on(event, handler));

    return () => {
      events.forEach((event) => socket.off(event, handler));
      socket.disconnect();
    };
  }, [isAuthenticated, accessToken, user, queryClient]);
}
