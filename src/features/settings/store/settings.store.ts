import { create } from 'zustand';

type SettingsSection = 'general' | 'security' | 'billing' | 'users' | 'notifications';

interface SettingsState {
    activeSection: SettingsSection;
    setActiveSection: (section: SettingsSection) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    activeSection: 'general',
    setActiveSection: (activeSection) => set({ activeSection }),
}));
