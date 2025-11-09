import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  getEffectiveTheme: () => "light" | "dark";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",

      setMode: (mode: ThemeMode) => {
        console.log("🎨 [ThemeStore] Setting theme mode:", mode);
        set({ mode });
      },

      getEffectiveTheme: () => {
        const { mode } = get();
        if (mode === "system") {
          const systemTheme = useColorScheme();
          return systemTheme === "dark" ? "dark" : "light";
        }
        return mode;
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
