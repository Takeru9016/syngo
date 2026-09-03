// Integration test for the assembled theme path: importing the real `@/theme`
// (which runs StyleSheet.configure), switching themes via UnistylesRuntime, and
// rendering a real screen whose styles are built from a theme callback. This is
// the path that unit tests miss — each of them imports `@/theme` itself, so
// none of them would notice if nothing in the app entry graph did.
import "@/theme";
import React from "react";
import { act, render, screen } from "@testing-library/react-native";
import { UnistylesRuntime } from "react-native-unistyles";

import PairScreen from "../pair";
import { usePairingStore } from "@/features/pairing";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn() },
}));

jest.mock("@/services/profile/profile.service", () => ({
  subscribeToProfile: jest.fn(() => jest.fn()),
}));

jest.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() }),
}));

jest.mock("@/state/haptics", () => ({
  triggerSelectionHaptic: jest.fn(),
}));

jest.mock("@/features/pairing/store", () => ({
  usePairingStore: jest.fn(),
}));

const mockedStore = usePairingStore as unknown as jest.Mock;

const storeState = {
  isPaired: false,
  pairId: null,
  code: "ABC-123",
  expiresAt: Date.now() + 600_000,
  isLoading: false,
  error: null,
  generateCode: jest.fn(),
  redeemCode: jest.fn(),
  checkExistingCode: jest.fn().mockResolvedValue(true),
  setPairId: jest.fn(),
  clearError: jest.fn(),
};

describe("PairScreen theme integration", () => {
  beforeEach(() => {
    mockedStore.mockReturnValue(storeState);
  });

  it("renders with a registered theme applied", async () => {
    UnistylesRuntime.setTheme("rose_dark");

    await render(<PairScreen />);

    expect(screen.getByText("Pair with your partner")).toBeTruthy();
    expect(screen.getByText("ABC-123")).toBeTruthy();
  });

  it("exposes an on-primary label color that is not the surface background", async () => {
    UnistylesRuntime.setTheme("coral_light");
    await render(<PairScreen />);

    const label = screen.getByText("Copy");
    const flattened = Object.assign(
      {},
      ...[label.props.style].flat(Infinity).filter(Boolean),
    );
    expect(flattened.color).toBe("#201716");
  });

  it("disables Copy/Share once the code expires, without another store update", async () => {
    jest.useFakeTimers();
    try {
      mockedStore.mockReturnValue({
        ...storeState,
        expiresAt: Date.now() + 2_000,
      });

      await render(<PairScreen />);

      const copyButton = screen.getByText("Copy").parent!;
      expect(copyButton.props.accessibilityState?.disabled).toBeFalsy();

      await act(async () => {
        jest.advanceTimersByTime(4_000);
      });

      expect(
        screen.getByText("Copy").parent!.props.accessibilityState?.disabled,
      ).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});
