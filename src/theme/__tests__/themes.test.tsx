import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { themes } from "../themes";
import "../index"; // registers themes/breakpoints as a side effect

describe("theme registration", () => {
  it("registers exactly 16 themes, one per scheme x mode combination", () => {
    const keys = Object.keys(themes).sort();
    const expected = [
      "coral_light",
      "coral_dark",
      "rose_light",
      "rose_dark",
      "plum_light",
      "plum_dark",
      "lavender_light",
      "lavender_dark",
      "mocha_light",
      "mocha_dark",
      "ocean_light",
      "ocean_dark",
      "sunset_light",
      "sunset_dark",
      "sky_light",
      "sky_dark",
    ].sort();
    expect(keys).toEqual(expected);
  });

  it("keeps a scheme's primary color identical across light and dark", () => {
    expect(themes.rose_light.colors.primary).toBe(themes.rose_dark.colors.primary);
    expect(themes.rose_light.colors.primary).toBe("#E8AEB8");
  });

  it("varies structural colors by mode but not by scheme", () => {
    expect(themes.coral_light.colors.background).toBe(
      themes.sky_light.colors.background,
    );
    expect(themes.coral_light.colors.background).not.toBe(
      themes.coral_dark.colors.background,
    );
  });
});

const styles = StyleSheet.create((theme) => ({
  label: {
    color: theme.colors.primary,
  },
}));

function Probe() {
  return <Text style={styles.label}>hello</Text>;
}

describe("Unistyles theme switching", () => {
  it("resolves a themed style for an explicitly-set theme without throwing", async () => {
    UnistylesRuntime.setTheme("sunset_light");
    await render(<Probe />);
    expect(screen.getByText("hello")).toBeTruthy();
  });
});
