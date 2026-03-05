import { create } from 'zustand';
import type { AestheticStatus } from '@nuvet/types';

interface AestheticsState {
    selectedId: string | null;
    statusFilter: AestheticStatus | '';
    groomerId: string;
    page: number;
    setSelectedId: (id: string | null) => void;
    setStatusFilter: (status: AestheticStatus | '') => void;
    setGroomerId: (groomerId: string) => void;
    setPage: (page: number) => void;
    reset: () => void;
}

export const useAestheticsStore = create<AestheticsState>((set) => ({
    selectedId: null,
    statusFilter: '',
    groomerId: '',
    page: 1,
    setSelectedId: (selectedId) => set({ selectedId }),
    setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
    setGroomerId: (groomerId) => set({ groomerId, page: 1 }),
    setPage: (page) => set({ page }),
    reset: () => set({ selectedId: null, statusFilter: '', groomerId: '', page: 1 }),
}));
