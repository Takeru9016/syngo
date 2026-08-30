import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import "../index"; // registers themes/breakpoints as a side effect

const styles = StyleSheet.create((theme) => ({
  label: {
    color: theme.colors.primary,
  },
}));

function Probe() {
  return <Text style={styles.label}>hello</Text>;
}

describe("Unistyles theme registration", () => {
  it("resolves a themed style without throwing", async () => {
    await render(<Probe />);
    expect(screen.getByText("hello")).toBeTruthy();
  });
});
