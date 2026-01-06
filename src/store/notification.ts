import { create } from "zustand";
import { AppNotification } from "@/types";

export type NotificationState = {
  // State
  notifications: AppNotification[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  setNotifications: (notifications: AppNotification[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  clear: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  // Initial state
  notifications: [],
  isLoading: true,
  error: null,

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
}));
