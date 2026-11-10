import { create } from 'zustand';

interface PortalState {
  isSidebarOpen: boolean;
  selectedGrade: number | null; // null indicates 'All Grades'
  searchQuery: string;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSelectedGrade: (grade: number | null) => void;
  setSearchQuery: (query: string) => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  isSidebarOpen: true,
  selectedGrade: null,
  searchQuery: '',
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSelectedGrade: (grade) => set({ selectedGrade: grade }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
