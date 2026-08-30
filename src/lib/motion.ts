import * as Haptics from "expo-haptics";
import type { WithSpringConfig } from "react-native-reanimated";

export const springs = {
  pressIn: {
    stiffness: 400,
    damping: 20,
    mass: 0.5,
    overshootClamping: false,
  } satisfies WithSpringConfig,
  pressOut: {
    stiffness: 300,
    damping: 18,
    mass: 0.5,
    overshootClamping: false,
  } satisfies WithSpringConfig,
  gentle: {
    stiffness: 120,
    damping: 16,
    mass: 1,
    overshootClamping: false,
  } satisfies WithSpringConfig,
};

export type InteractionKind = "press" | "success" | "error";

export function hapticForInteraction(kind: InteractionKind): void {
  switch (kind) {
    case "press":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    case "success":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    case "error":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
  }
}
