import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
      setToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
    }),
    { name: 'civic-auth' }
  )
);

export default useAuthStore;
