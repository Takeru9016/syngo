import { springs, hapticForInteraction } from "../motion";
import * as Haptics from "expo-haptics";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
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

  it("fires a medium impact for 'success'", () => {
    hapticForInteraction("success");
    expect(Haptics.impactAsync).toHaveBeenCalledWith("medium");
  });
});
