import { useEffect } from "react";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";
import { useThemeStore } from "@/state/theme";

export function useThemeSync(): void {
  const mode = useThemeStore((s) => s.mode);
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { rt } = useUnistyles();

  const resolvedMode = mode === "system" ? rt.colorScheme : mode;
  const themeName = `${colorScheme}_${resolvedMode === "dark" ? "dark" : "light"}` as const;

  useEffect(() => {
    UnistylesRuntime.setTheme(themeName);
  }, [themeName]);
}
