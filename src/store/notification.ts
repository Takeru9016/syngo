import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppNotification } from "@/types";

export type NotificationState = {
  // State
  notifications: AppNotification[];
  isLoading: boolean;
  error: Error | null;
  _hasHydrated: boolean;

  // Actions
  setNotifications: (notifications: AppNotification[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  clear: () => void;
  setHasHydrated: (state: boolean) => void;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      // Initial state
      notifications: [],
      isLoading: true,
      error: null,
      _hasHydrated: false,

      // Actions
      setNotifications: (notifications) => {
        set({ notifications, isLoading: false });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clear: () => {
        set({ notifications: [], isLoading: false, error: null });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: "notification-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist notifications, not loading/error states
      partialize: (state) => ({ notifications: state.notifications }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
