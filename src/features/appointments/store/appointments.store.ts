import { create } from 'zustand';

interface AppointmentsState {
    selectedId: string | null;
    staffId: string;
    statusFilter: string;
    dateFrom: string;
    dateTo: string;
    page: number;
    setSelectedId: (id: string | null) => void;
    setStaffId: (staffId: string) => void;
    setStatusFilter: (status: string) => void;
    setDateRange: (from: string, to: string) => void;
    setPage: (page: number) => void;
    reset: () => void;
}

export const useAppointmentsStore = create<AppointmentsState>((set) => ({
    selectedId: null,
    staffId: '',
    statusFilter: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    setSelectedId: (selectedId) => set({ selectedId }),
    setStaffId: (staffId) => set({ staffId }),
    setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
    setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo, page: 1 }),
    setPage: (page) => set({ page }),
    reset: () => set({ selectedId: null, staffId: '', statusFilter: '', dateFrom: '', dateTo: '', page: 1 }),
}));
