import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Branch {
    id: string;
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    website?: string | null;
    isMain: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: { users: number; appointments: number };
}

interface BranchesState {
    activeBranchId: string | null;
    setActiveBranch: (id: string | null) => void;
}

export const useBranchesStore = create<BranchesState>()(
    persist(
        (set) => ({
            activeBranchId: null,
            setActiveBranch: (activeBranchId) => set({ activeBranchId }),
        }),
        { name: 'nuvet-active-branch' },
    ),
);
