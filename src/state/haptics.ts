import * as Haptics from "expo-haptics";
import { useNotificationPreferences } from "@/store/notificationPreference";

// Centralized toggle in case you ever want to disable in builds / tests
const HAPTICS_ENABLED = true;

/* Fire-and-forget helper with global enable flag + error guard. */
async function runHaptic(fn: () => Promise<void>) {
  if (!HAPTICS_ENABLED) return;

  // Check user preference for vibration
  const { preferences } = useNotificationPreferences.getState();
  if (!preferences.vibration) return;

  try {
    await fn();
  } catch (e) {
    // Don't ever break UX because of haptics
    if (__DEV__) {
      console.warn("Haptics error:", e);
    }
  }
}

/* Light tap – good for basic button presses, toggles, etc. */
export function triggerLightHaptic() {
  void runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/* Medium impact – for primary actions (e.g. “Pair now”). */
export function triggerMediumHaptic() {
  void runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

/* Strong impact – for destructive / very important actions. */
export function triggerHeavyHaptic() {
  void runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
}

/* Selection change – great for chips, theme toggles, switches, etc. */
export function triggerSelectionHaptic() {
  void runHaptic(() => Haptics.selectionAsync());
}

/* Success pattern – e.g. successfully paired, saved, etc. */
export function triggerSuccessHaptic() {
  void runHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  );
}

/* Error pattern – e.g. invalid code, pairing failed, etc. */
export function triggerErrorHaptic() {
  void runHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  );
}

/* Warning pattern – e.g. about to delete / leave pair. */
export function triggerWarningHaptic() {
  void runHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  );
}
