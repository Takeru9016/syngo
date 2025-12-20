import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";

import { db } from "@/config/firebase";
import { useAuthStore } from "./auth";

export interface NotificationPreferences {
  enabled: boolean;
  todoReminders: boolean;
  stickerNotifications: boolean;
  nudgeNotifications: boolean;
  favoriteUpdates: boolean;
  pairEvents: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
  sound: boolean;
  vibration: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  todoReminders: true,
  stickerNotifications: true,
  nudgeNotifications: true,
  favoriteUpdates: true,
  pairEvents: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  sound: true,
  vibration: true,
};

interface NotificationPreferencesStore {
  preferences: NotificationPreferences;
  updatePreferences: (
    updates: Partial<NotificationPreferences>
  ) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

export const useNotificationPreferences =
  create<NotificationPreferencesStore>()(
    persist(
      (set, get) => ({
        preferences: DEFAULT_PREFERENCES,

        updatePreferences: async (updates) => {
          const newPreferences = { ...get().preferences, ...updates };
          set({ preferences: newPreferences });

          // Sync to Firestore
          const uid = useAuthStore.getState().uid;
          if (uid) {
            try {
              await setDoc(
                doc(db, "users", uid),
                { notificationPreferences: newPreferences },
                { merge: true }
              );

            } catch (error) {
              console.error(
                "❌ Failed to sync notification preferences:",
                error
              );
            }
          }
        },

        resetPreferences: async () => {
          set({ preferences: DEFAULT_PREFERENCES });

          const uid = useAuthStore.getState().uid;
          if (uid) {
            try {
              await setDoc(
                doc(db, "users", uid),
                { notificationPreferences: DEFAULT_PREFERENCES },
                { merge: true }
              );

            } catch (error) {
              console.error(
                "❌ Failed to reset notification preferences:",
                error
              );
            }
          }
        },
      }),
      {
        name: "notification-preferences",
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );
