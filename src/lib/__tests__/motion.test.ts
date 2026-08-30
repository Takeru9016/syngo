import { springs, hapticForInteraction } from "../motion";
import * as Haptics from "expo-haptics";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
  NotificationFeedbackType: { Success: "success", Error: "error" },
}));

describe("springs", () => {
  it("pressIn is stiffer (higher stiffness) than gentle", () => {
    expect(springs.pressIn.stiffness).toBeGreaterThan(springs.gentle.stiffness!);
  });

  it("all spring configs disable overshoot clamping consistently", () => {
    expect(springs.pressIn.overshootClamping).toBe(false);
    expect(springs.pressOut.overshootClamping).toBe(false);
    expect(springs.gentle.overshootClamping).toBe(false);
  });
});

describe("hapticForInteraction", () => {
  it("fires a light impact for 'press'", () => {
    hapticForInteraction("press");
    expect(Haptics.impactAsync).toHaveBeenCalledWith("light");
  });

  it("fires a success notification for 'success'", () => {
    hapticForInteraction("success");
    expect(Haptics.notificationAsync).toHaveBeenCalledWith("success");
  });

  it("fires an error notification for 'error'", () => {
    hapticForInteraction("error");
    expect(Haptics.notificationAsync).toHaveBeenCalledWith("error");
  });
});
