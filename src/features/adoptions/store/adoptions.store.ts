import { create } from 'zustand';
import type { AdoptionStatus } from '@nuvet/types';

interface AdoptionsState {
    selectedId: string | null;
    statusFilter: AdoptionStatus | '';
    page: number;
    setSelectedId: (id: string | null) => void;
    setStatusFilter: (status: AdoptionStatus | '') => void;
    setPage: (page: number) => void;
    reset: () => void;
}

export const useAdoptionsStore = create<AdoptionsState>((set) => ({
    selectedId: null,
    statusFilter: '',
    page: 1,
    setSelectedId: (selectedId) => set({ selectedId }),
    setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
    setPage: (page) => set({ page }),
    reset: () => set({ selectedId: null, statusFilter: '', page: 1 }),
}));
