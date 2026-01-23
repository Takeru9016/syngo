import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";

import { db } from "@/config/firebase";
import { useAuthStore } from "./auth";
import {
  NotificationCustomization,
  NotificationCategory,
  NotificationColorScheme,
  NotificationVisualStyle,
  DEFAULT_NOTIFICATION_CUSTOMIZATION,
  NOTIFICATION_THEME_PRESETS,
} from "@/types/notification-theme.types";

// Helper to remove undefined values from objects before sending to Firestore
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

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
  customization: NotificationCustomization;
  updatePreferences: (
    updates: Partial<NotificationPreferences>,
  ) => Promise<void>;
  resetPreferences: () => Promise<void>;
  // Customization methods
  updateCustomization: (
    updates: Partial<NotificationCustomization>,
  ) => Promise<void>;
  updateCategoryColors: (
    category: NotificationCategory,
    colors: Partial<NotificationColorScheme>,
  ) => Promise<void>;
  updateCategoryStyle: (
    category: NotificationCategory,
    style: NotificationVisualStyle,
  ) => Promise<void>;
  applyPreset: (presetId: string) => Promise<void>;
  resetCustomization: () => Promise<void>;
  getColorsForCategory: (
    category: NotificationCategory,
  ) => NotificationColorScheme;
  getStyleForCategory: (
    category: NotificationCategory,
  ) => NotificationVisualStyle;
}

export const useNotificationPreferences =
  create<NotificationPreferencesStore>()(
    persist(
      (set, get) => ({
        preferences: DEFAULT_PREFERENCES,
        customization: DEFAULT_NOTIFICATION_CUSTOMIZATION,

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
                { merge: true },
              );
            } catch (error) {
              console.error(
                "❌ Failed to sync notification preferences:",
                error,
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
                { merge: true },
              );
            } catch (error) {
              console.error(
                "❌ Failed to reset notification preferences:",
                error,
              );
            }
          }
        },

        updateCustomization: async (updates) => {
          const newCustomization = {
            ...get().customization,
            ...updates,
            activePreset: null, // Mark as custom when manually updated
          };
          set({ customization: newCustomization });

          const uid = useAuthStore.getState().uid;
          if (uid) {
            try {
              await setDoc(
                doc(db, "users", uid),
                {
                  notificationCustomization:
                    sanitizeForFirestore(newCustomization),
                },
                { merge: true },
              );
            } catch (error) {
              console.error(
                "❌ Failed to sync notification customization:",
                error,
              );
            }
          }
        },

        updateCategoryColors: async (category, colors) => {
          const currentColors = get().customization.colors;
          const newColors = {
            ...currentColors,
            [category]: { ...currentColors[category], ...colors },
          };
          const newCustomization = {
            ...get().customization,
            colors: newColors,
            activePreset: null,
          };
          set({ customization: newCustomization });

          const uid = useAuthStore.getState().uid;
          if (uid) {
            try {
              await setDoc(
                doc(db, "users", uid),
                {
                  notificationCustomization:
                    sanitizeForFirestore(newCustomization),
                },
                { merge: true },
              );
            } catch (error) {
              console.error("❌ Failed to sync category colors:", error);
            }
          }
        },

        applyPreset: async (presetId) => {
          const preset = NOTIFICATION_THEME_PRESETS.find(
            (p) => p.id === presetId,
          );
          if (!preset) return;

          const newCustomization: NotificationCustomization = {
            activePreset: presetId,
            colors: preset.colors,
            visualStyle: preset.visualStyle,
            categoryStyles: {}, // Clear per-category overrides (empty object, not undefined for Firestore)
            vibrationPattern: preset.vibrationPattern,
            borderRadius: get().customization.borderRadius,
            shadowIntensity: get().customization.shadowIntensity,
          };
          set({ customization: newCustomization });

          const uid = useAuthStore.getState().uid;
          if (uid) {
            try {
              await setDoc(
                doc(db, "users", uid),
                {
                  notificationCustomization:
                    sanitizeForFirestore(newCustomization),
                },
                { merge: true },
              );
            } catch (error) {
              console.error("❌ Failed to apply preset:", error);
            }
          }
        },

        resetCustomization: async () => {
          set({ customization: DEFAULT_NOTIFICATION_CUSTOMIZATION });

          const uid = useAuthStore.getState().uid;
          if (uid) {
            try {
              await setDoc(
                doc(db, "users", uid),
                {
                  notificationCustomization: DEFAULT_NOTIFICATION_CUSTOMIZATION,
                },
                { merge: true },
              );
            } catch (error) {
              console.error("❌ Failed to reset customization:", error);
            }
          }
        },

        getColorsForCategory: (category) => {
          const colors = get().customization.colors[category];
          // Fallback to default if category colors are missing (e.g., newly added categories)
          return colors || DEFAULT_NOTIFICATION_CUSTOMIZATION.colors[category];
        },

        getStyleForCategory: (category) => {
          const { customization } = get();
          // Return category-specific style if set, otherwise global style
          return (
            customization.categoryStyles?.[category] ??
            customization.visualStyle
          );
        },

        updateCategoryStyle: async (category, style) => {
          const currentStyles = get().customization.categoryStyles || {};
          const newCategoryStyles = {
            ...currentStyles,
            [category]: style,
          };
          const newCustomization = {
            ...get().customization,
            categoryStyles: newCategoryStyles,
            activePreset: null,
          };
          set({ customization: newCustomization });

          const uid = useAuthStore.getState().uid;
          if (uid) {
            try {
              await setDoc(
                doc(db, "users", uid),
                {
                  notificationCustomization:
                    sanitizeForFirestore(newCustomization),
                },
                { merge: true },
              );
            } catch (error) {
              console.error("❌ Failed to sync category style:", error);
            }
          }
        },
      }),
      {
        name: "notification-preferences",
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
  );
