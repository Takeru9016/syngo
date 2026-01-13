/**
 * App Update Configuration
 *
 * Controls OTA updates (via EAS Update) and native store updates.
 */

import Constants from "expo-constants";
import { Platform, Linking } from "react-native";

/**
 * Minimum supported app version.
 * Users with versions below this will be forced to update via app store.
 * Format: "major.minor.patch" (e.g., "1.0.0")
 *
 * Update this when you release a breaking change that requires
 * all users to have the latest native binary.
 */
export const MIN_SUPPORTED_VERSION = "1.0.0";

/**
 * How often to check for OTA updates (in milliseconds).
 * Default: Every 30 minutes when app is in foreground.
 */
export const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000;

/**
 * Whether to show the update modal when OTA update is available.
 * Set to false for silent updates (applies on next restart).
 */
export const SHOW_OTA_UPDATE_MODAL = true;

/**
 * Whether to automatically download OTA updates in the background.
 */
export const AUTO_DOWNLOAD_OTA = true;

/**
 * Get the current app version from Constants.
 */
export function getCurrentAppVersion(): string {
  return Constants.expoConfig?.version ?? "1.0.0";
}

/**
 * Get app store URLs for redirecting users to update.
 */
export function getStoreUrl(): string {
  const iosUrl =
    Constants.expoConfig?.ios?.appStoreUrl ??
    "https://apps.apple.com/in/app/syngo/id6755762478";

  const androidUrl =
    Constants.expoConfig?.android?.playStoreUrl ??
    "https://play.google.com/store/apps/details?id=com.sahiljadhav.syngo";

  return Platform.OS === "ios" ? iosUrl : androidUrl;
}

/**
 * Open the app store for update.
 */
export async function openAppStore(): Promise<void> {
  const url = getStoreUrl();
  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
  } else {
    console.error("Cannot open app store URL:", url);
  }
}

/**
 * Compare two semantic version strings.
 * Returns:
 *  -1 if v1 < v2
 *   0 if v1 === v2
 *   1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}

/**
 * Check if current version is below minimum supported version.
 */
export function isVersionOutdated(
  currentVersion: string,
  minVersion: string
): boolean {
  return compareVersions(currentVersion, minVersion) < 0;
}
