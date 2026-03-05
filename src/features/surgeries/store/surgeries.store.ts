import { create } from 'zustand';
import type { SurgeryStatus } from '@nuvet/types';

interface SurgeriesState {
    selectedId: string | null;
    statusFilter: SurgeryStatus | '';
    vetId: string;
    page: number;
    setSelectedId: (id: string | null) => void;
    setStatusFilter: (status: SurgeryStatus | '') => void;
    setVetId: (vetId: string) => void;
    setPage: (page: number) => void;
    reset: () => void;
}

export const useSurgeriesStore = create<SurgeriesState>((set) => ({
    selectedId: null,
    statusFilter: '',
    vetId: '',
    page: 1,
    setSelectedId: (selectedId) => set({ selectedId }),
    setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
    setVetId: (vetId) => set({ vetId }),
    setPage: (page) => set({ page }),
    reset: () => set({ selectedId: null, statusFilter: '', vetId: '', page: 1 }),
}));
