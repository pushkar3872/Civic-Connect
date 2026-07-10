import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  resetUnread: () => set({ unreadCount: 0 }),
}));

export default useNotificationStore;
