import "../../../../theme";
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Countdown } from "../Countdown";

describe("Countdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows a placeholder when there is no expiry", async () => {
    await render(<Countdown expiresAt={null} />);
    expect(screen.getByText("--:--")).toBeTruthy();
  });

  it("formats remaining time as mm:ss", async () => {
    const expiresAt = Date.now() + 125_000; // 2:05
    await render(<Countdown expiresAt={expiresAt} />);
    expect(screen.getByText("02:05")).toBeTruthy();
  });

  it("shows 00:00 once expired", async () => {
    const expiresAt = Date.now() - 1_000;
    await render(<Countdown expiresAt={expiresAt} />);
    expect(screen.getByText("00:00")).toBeTruthy();
  });
});
