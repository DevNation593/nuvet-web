import { create } from 'zustand';

interface UsersState {
    selectedId: string | null;
    search: string;
    page: number;
    setSelectedId: (id: string | null) => void;
    setSearch: (search: string) => void;
    setPage: (page: number) => void;
    reset: () => void;
}

export const useUsersStore = create<UsersState>((set) => ({
    selectedId: null,
    search: '',
    page: 1,
    setSelectedId: (selectedId) => set({ selectedId }),
    setSearch: (search) => set({ search, page: 1 }),
    setPage: (page) => set({ page }),
    reset: () => set({ selectedId: null, search: '', page: 1 }),
}));
