import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  getActiveTheme: () => 'light' | 'dark';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  setMode: (mode) => set({ mode }),
  getActiveTheme: () => {
    const { mode } = get();
    if (mode === 'system') {
      // This will be called from a component context where useColorScheme works
      return 'light'; // fallback
    }
    return mode;
  },
}));