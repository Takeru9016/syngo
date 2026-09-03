import { act, renderHook, waitFor } from "@testing-library/react-native";
import { UnistylesRuntime } from "react-native-unistyles";
import { useThemeStore } from "@/state/theme";
import { useThemeSync } from "../useThemeSync";
import "../index";

describe("useThemeSync", () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: "system", colorScheme: "coral" });
    jest.spyOn(UnistylesRuntime, "setTheme");
    (UnistylesRuntime as { colorScheme: string }).colorScheme = "light";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sets the theme for an explicit light mode", async () => {
    useThemeStore.setState({ mode: "light", colorScheme: "rose" });
    renderHook(() => useThemeSync());
    await waitFor(() => {
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("rose_light");
    });
  });

  it("sets the theme for an explicit dark mode", async () => {
    useThemeStore.setState({ mode: "dark", colorScheme: "ocean" });
    renderHook(() => useThemeSync());
    await waitFor(() => {
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("ocean_dark");
    });
  });

  it("resolves system mode using the OS color scheme", async () => {
    (UnistylesRuntime as { colorScheme: string }).colorScheme = "dark";
    useThemeStore.setState({ mode: "system", colorScheme: "sunset" });
    renderHook(() => useThemeSync());
    await waitFor(() => {
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("sunset_dark");
    });
  });

  it("re-runs when colorScheme changes", async () => {
    useThemeStore.setState({ mode: "light", colorScheme: "coral" });
    renderHook(() => useThemeSync());
    await waitFor(() => {
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("coral_light");
    });

    (UnistylesRuntime.setTheme as jest.Mock).mockClear();
    act(() => {
      useThemeStore.setState({ mode: "light", colorScheme: "plum" });
    });
    await waitFor(() => {
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("plum_light");
    });
  });
});
