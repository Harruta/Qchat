import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create(
  persist(
    (set) => ({
      useLocalStorage: false,
      toggleStoragePreference: () => 
        set((state) => ({ useLocalStorage: !state.useLocalStorage })),
    }),
    {
      name: "chat-settings",
    }
  )
); 