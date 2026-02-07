/**
 * Extension Storage
 *
 * Native module wrapper for iOS App Groups UserDefaults.
 * Used to share data between the main app and widget extensions.
 *
 * On iOS, this writes to the shared App Group container.
 * On Android, this will use SharedPreferences (implemented when Android widgets are added).
 */

import { Platform } from "react-native";

// Type for the native ExtensionStorage module
interface ExtensionStorageNative {
  setString: (key: string, value: string, group: string) => void;
  get: (key: string, group: string) => string | null;
  remove: (key: string, group: string) => void;
  reloadWidget: (kind: string) => void;
}

// Helper to safely access the native module
function getNativeModule(): ExtensionStorageNative | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expoGlobal = globalThis as any;
  return expoGlobal?.expo?.modules?.ExtensionStorage as
    | ExtensionStorageNative
    | undefined;
}

// App Group identifier (must match app.config.ts)
const APP_GROUP_ID = "group.com.sahiljadhav.syngo";
const WIDGET_KIND = "SyngoWidget";

/**
 * Extension Storage API
 */
export const ExtensionStorage = {
  /**
   * Store a value in shared storage
   */
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "ios") {
      // Use UserDefaults with App Group via expo.modules
      const nativeModule = getNativeModule();
      if (nativeModule?.setString) {
        console.log(`[ExtensionStorage] Saving data for key: ${key}`);
        nativeModule.setString(key, value, APP_GROUP_ID);
        console.log(
          `[ExtensionStorage] Successfully saved data for key: ${key}`,
        );
      } else {
        // Fallback for development without native module
        console.warn(
          "[ExtensionStorage] Native module not available, data will not be saved to widgets",
        );
      }
    } else if (Platform.OS === "android") {
      // Android implementation will be added later
      // Will use SharedPreferences via react-native-android-widget
      console.log("[ExtensionStorage] Android storage not yet implemented");
    }
  },

  /**
   * Get a value from shared storage
   */
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "ios") {
      const nativeModule = getNativeModule();
      if (nativeModule?.get) {
        return nativeModule.get(key, APP_GROUP_ID);
      }
    }
    return null;
  },

  /**
   * Remove a value from shared storage
   */
  async remove(key: string): Promise<void> {
    if (Platform.OS === "ios") {
      const nativeModule = getNativeModule();
      if (nativeModule?.remove) {
        nativeModule.remove(key, APP_GROUP_ID);
      }
    }
  },

  /**
   * Trigger widget reload
   * Call this after updating widget data
   */
  async reloadWidgets(): Promise<void> {
    if (Platform.OS === "ios") {
      const nativeModule = getNativeModule();
      if (nativeModule?.reloadWidget) {
        console.log(
          `[ExtensionStorage] Reloading widgets of kind: ${WIDGET_KIND}`,
        );
        nativeModule.reloadWidget(WIDGET_KIND);
        console.log("[ExtensionStorage] Widget reload triggered");
      } else {
        console.warn("[ExtensionStorage] reloadWidget not available");
      }
    } else if (Platform.OS === "android") {
      // Android widget refresh will be added later
      console.log(
        "[ExtensionStorage] Android widget reload not yet implemented",
      );
    }
  },
};
