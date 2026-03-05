import { create } from 'zustand';

interface ProfileState {
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
    isEditing: false,
    setIsEditing: (isEditing) => set({ isEditing }),
}));
