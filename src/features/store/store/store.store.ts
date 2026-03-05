import { create } from 'zustand';

interface InventoryState {
    selectedProductId: string | null;
    selectedOrderId: string | null;
    categoryFilter: string;
    page: number;
    setSelectedProductId: (id: string | null) => void;
    setSelectedOrderId: (id: string | null) => void;
    setCategoryFilter: (category: string) => void;
    setPage: (page: number) => void;
    reset: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
    selectedProductId: null,
    selectedOrderId: null,
    categoryFilter: '',
    page: 1,
    setSelectedProductId: (selectedProductId) => set({ selectedProductId }),
    setSelectedOrderId: (selectedOrderId) => set({ selectedOrderId }),
    setCategoryFilter: (categoryFilter) => set({ categoryFilter, page: 1 }),
    setPage: (page) => set({ page }),
    reset: () => set({ selectedProductId: null, selectedOrderId: null, categoryFilter: '', page: 1 }),
}));
