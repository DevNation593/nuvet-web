import { create } from 'zustand';

interface MedicalRecordsState {
    selectedPetId: string | null;
    selectedRecordId: string | null;
    page: number;
    setSelectedPetId: (petId: string | null) => void;
    setSelectedRecordId: (id: string | null) => void;
    setPage: (page: number) => void;
    reset: () => void;
}

export const useMedicalRecordsStore = create<MedicalRecordsState>((set) => ({
    selectedPetId: null,
    selectedRecordId: null,
    page: 1,
    setSelectedPetId: (selectedPetId) => set({ selectedPetId, selectedRecordId: null, page: 1 }),
    setSelectedRecordId: (selectedRecordId) => set({ selectedRecordId }),
    setPage: (page) => set({ page }),
    reset: () => set({ selectedPetId: null, selectedRecordId: null, page: 1 }),
}));
