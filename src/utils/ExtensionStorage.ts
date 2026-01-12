/**
 * ExtensionStorage
 *
 * Native module wrapper for sharing data between React Native app and
 * native widget extensions.
 *
 * iOS: Uses App Groups UserDefaults
 * Android: Uses SharedPreferences
 *
 * This is a STUB that will be replaced by the actual native module
 * implementation via @bacons/apple-targets and react-native-android-widget.
 */

import { Platform, NativeModules } from "react-native";

import { APP_GROUP_ID } from "@/types/widget-data.types";

// Check if native module is available
const NativeExtensionStorage = NativeModules.ExtensionStorage;

/**
 * ExtensionStorage API for widget data sharing
 */
export const ExtensionStorage = {
  /**
   * Store a value in shared storage
   * @param key Storage key
   * @param value JSON string value
   */
  async set(key: string, value: string): Promise<void> {
    if (NativeExtensionStorage?.set) {
      return NativeExtensionStorage.set(key, value);
    }

    // Fallback for development (Expo Go doesn't have native modules)
    if (__DEV__) {
      console.log(
        `[ExtensionStorage] DEV set(${key}):`,
        value.substring(0, 100) + "..."
      );
      // Use AsyncStorage as fallback in dev
      const AsyncStorage = await import(
        "@react-native-async-storage/async-storage"
      );
      await AsyncStorage.default.setItem(`widget:${key}`, value);
    }
  },

  /**
   * Get a value from shared storage
   * @param key Storage key
   * @returns JSON string value or null
   */
  async get(key: string): Promise<string | null> {
    if (NativeExtensionStorage?.get) {
      return NativeExtensionStorage.get(key);
    }

    // Fallback for development
    if (__DEV__) {
      const AsyncStorage = await import(
        "@react-native-async-storage/async-storage"
      );
      return AsyncStorage.default.getItem(`widget:${key}`);
    }

    return null;
  },

  /**
   * Remove a value from shared storage
   * @param key Storage key
   */
  async remove(key: string): Promise<void> {
    if (NativeExtensionStorage?.remove) {
      return NativeExtensionStorage.remove(key);
    }

    // Fallback for development
    if (__DEV__) {
      const AsyncStorage = await import(
        "@react-native-async-storage/async-storage"
      );
      await AsyncStorage.default.removeItem(`widget:${key}`);
    }
  },

  /**
   * Trigger widget timeline reload
   * iOS: Calls WidgetCenter.shared.reloadAllTimelines()
   * Android: Updates widget via AppWidgetManager
   */
  async reloadWidget(): Promise<void> {
    if (NativeExtensionStorage?.reloadWidget) {
      return NativeExtensionStorage.reloadWidget();
    }

    // Log in development
    if (__DEV__) {
      console.log("[ExtensionStorage] DEV reloadWidget() called");
    }
  },

  /**
   * Check if native extension storage is available
   */
  isAvailable(): boolean {
    return !!NativeExtensionStorage;
  },

  /**
   * Get the App Group ID (iOS only)
   */
  getAppGroupId(): string {
    return APP_GROUP_ID;
  },

  /**
   * Get current platform
   */
  getPlatform(): "ios" | "android" | "web" {
    return Platform.OS as "ios" | "android" | "web";
  },
};

export default ExtensionStorage;
