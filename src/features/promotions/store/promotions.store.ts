import { create } from 'zustand';

interface PromotionsState {
    selectedId: string | null;
    isActiveFilter: boolean | null;
    page: number;
    setSelectedId: (id: string | null) => void;
    setIsActiveFilter: (active: boolean | null) => void;
    setPage: (page: number) => void;
    reset: () => void;
}

export const usePromotionsStore = create<PromotionsState>((set) => ({
    selectedId: null,
    isActiveFilter: null,
    page: 1,
    setSelectedId: (selectedId) => set({ selectedId }),
    setIsActiveFilter: (isActiveFilter) => set({ isActiveFilter, page: 1 }),
    setPage: (page) => set({ page }),
    reset: () => set({ selectedId: null, isActiveFilter: null, page: 1 }),
}));
