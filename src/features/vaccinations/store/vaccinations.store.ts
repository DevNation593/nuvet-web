import { create } from 'zustand';

interface VaccinationsState {
    selectedPetId: string | null;
    selectedId: string | null;
    page: number;
    setSelectedPetId: (petId: string | null) => void;
    setSelectedId: (id: string | null) => void;
    setPage: (page: number) => void;
    reset: () => void;
}

export const useVaccinationsStore = create<VaccinationsState>((set) => ({
    selectedPetId: null,
    selectedId: null,
    page: 1,
    setSelectedPetId: (selectedPetId) => set({ selectedPetId, selectedId: null, page: 1 }),
    setSelectedId: (selectedId) => set({ selectedId }),
    setPage: (page) => set({ page }),
    reset: () => set({ selectedPetId: null, selectedId: null, page: 1 }),
}));
