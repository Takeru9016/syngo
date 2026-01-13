/**
 * useAppUpdates Hook
 *
 * Manages OTA updates (via expo-updates) and native store version checking.
 * Provides a unified interface for the hybrid update system.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import * as Updates from "expo-updates";
import {
  MIN_SUPPORTED_VERSION,
  UPDATE_CHECK_INTERVAL_MS,
  SHOW_OTA_UPDATE_MODAL,
  AUTO_DOWNLOAD_OTA,
  getCurrentAppVersion,
  isVersionOutdated,
  openAppStore,
} from "@/config/update.config";

export interface UpdateState {
  // OTA Update State
  isCheckingOta: boolean;
  otaUpdateAvailable: boolean;
  otaUpdateDownloaded: boolean;
  isDownloadingOta: boolean;

  // Store Update State
  storeUpdateRequired: boolean;
  currentVersion: string;
  minSupportedVersion: string;

  // Modal visibility (user can dismiss)
  showOtaModal: boolean;
}

export interface UpdateActions {
  checkForUpdates: () => Promise<void>;
  downloadOtaUpdate: () => Promise<void>;
  applyOtaUpdate: () => Promise<void>;
  dismissOtaModal: () => void;
  openStore: () => Promise<void>;
}

export function useAppUpdates(): UpdateState & UpdateActions {
  const [state, setState] = useState<UpdateState>({
    isCheckingOta: false,
    otaUpdateAvailable: false,
    otaUpdateDownloaded: false,
    isDownloadingOta: false,
    storeUpdateRequired: false,
    currentVersion: getCurrentAppVersion(),
    minSupportedVersion: MIN_SUPPORTED_VERSION,
    showOtaModal: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCheckedOnMount = useRef(false);

  /**
   * Check if store update is required.
   */
  const checkStoreUpdate = useCallback(() => {
    const currentVersion = getCurrentAppVersion();
    const required = isVersionOutdated(currentVersion, MIN_SUPPORTED_VERSION);

    setState((prev) => ({
      ...prev,
      storeUpdateRequired: required,
      currentVersion,
      minSupportedVersion: MIN_SUPPORTED_VERSION,
    }));

    return required;
  }, []);

  /**
   * Check for OTA updates via expo-updates.
   */
  const checkForOtaUpdate = useCallback(async (): Promise<boolean> => {
    // Skip in development mode or if updates are disabled
    if (!Updates.isEnabled || __DEV__) {
      console.log("📱 [Updates] Skipping OTA check (dev mode or disabled)");
      return false;
    }

    setState((prev) => ({ ...prev, isCheckingOta: true }));

    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log("📱 [Updates] OTA update available");
        setState((prev) => ({
          ...prev,
          otaUpdateAvailable: true,
          isCheckingOta: false,
        }));

        // Auto-download if enabled
        if (AUTO_DOWNLOAD_OTA) {
          await downloadOtaUpdateInternal();
        }

        return true;
      } else {
        console.log("📱 [Updates] App is up to date");
        setState((prev) => ({
          ...prev,
          otaUpdateAvailable: false,
          isCheckingOta: false,
        }));
        return false;
      }
    } catch (error) {
      console.error("📱 [Updates] Error checking for OTA update:", error);
      setState((prev) => ({ ...prev, isCheckingOta: false }));
      return false;
    }
  }, []);

  /**
   * Internal function to download OTA update.
   */
  const downloadOtaUpdateInternal = async (): Promise<void> => {
    if (!Updates.isEnabled || __DEV__) return;

    setState((prev) => ({ ...prev, isDownloadingOta: true }));

    try {
      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        console.log("📱 [Updates] OTA update downloaded successfully");
        setState((prev) => ({
          ...prev,
          otaUpdateDownloaded: true,
          isDownloadingOta: false,
          showOtaModal: SHOW_OTA_UPDATE_MODAL,
        }));
      } else {
        setState((prev) => ({ ...prev, isDownloadingOta: false }));
      }
    } catch (error) {
      console.error("📱 [Updates] Error downloading OTA update:", error);
      setState((prev) => ({ ...prev, isDownloadingOta: false }));
    }
  };

  /**
   * Combined check for all updates.
   */
  const checkForUpdates = useCallback(async (): Promise<void> => {
    // First check store version (blocks everything if outdated)
    const storeUpdateNeeded = checkStoreUpdate();

    // Only check OTA if no store update required
    if (!storeUpdateNeeded) {
      await checkForOtaUpdate();
    }
  }, [checkStoreUpdate, checkForOtaUpdate]);

  /**
   * Download OTA update (exposed action).
   */
  const downloadOtaUpdate = useCallback(async (): Promise<void> => {
    await downloadOtaUpdateInternal();
  }, []);

  /**
   * Apply OTA update and restart the app.
   */
  const applyOtaUpdate = useCallback(async (): Promise<void> => {
    if (!Updates.isEnabled || __DEV__) {
      console.log("📱 [Updates] Cannot apply update in dev mode");
      return;
    }

    try {
      console.log("📱 [Updates] Restarting app with new update...");
      await Updates.reloadAsync();
    } catch (error) {
      console.error("📱 [Updates] Error applying update:", error);
    }
  }, []);

  /**
   * Dismiss the OTA update modal (user chose "Later").
   */
  const dismissOtaModal = useCallback((): void => {
    setState((prev) => ({ ...prev, showOtaModal: false }));
  }, []);

  /**
   * Open app store for update.
   */
  const openStore = useCallback(async (): Promise<void> => {
    await openAppStore();
  }, []);

  // Check on mount
  useEffect(() => {
    if (!hasCheckedOnMount.current) {
      hasCheckedOnMount.current = true;

      // Small delay to let app initialize
      const timeout = setTimeout(() => {
        checkForUpdates();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [checkForUpdates]);

  // Periodic check for updates
  useEffect(() => {
    // Don't set up interval if store update is required (app is blocked)
    if (state.storeUpdateRequired) return;

    intervalRef.current = setInterval(() => {
      checkForUpdates();
    }, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkForUpdates, state.storeUpdateRequired]);

  return {
    ...state,
    checkForUpdates,
    downloadOtaUpdate,
    applyOtaUpdate,
    dismissOtaModal,
    openStore,
  };
}
