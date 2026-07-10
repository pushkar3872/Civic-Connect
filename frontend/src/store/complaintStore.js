import { create } from 'zustand';

const useComplaintStore = create((set) => ({
  filters: { status: '', category: '', priority: '', department: '' },
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () =>
    set({ filters: { status: '', category: '', priority: '', department: '' } }),
}));

export default useComplaintStore;
