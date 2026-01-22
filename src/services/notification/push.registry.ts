import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "@/services/auth/auth.service";

export type DeviceRecord = {
  deviceId: string;
  pushToken: string;
  platform: "ios" | "android" | "web";
  brand?: string | null;
  model?: string | null;
  osVersion?: string | null;
  updatedAt: any;
};

export async function registerDevicePushToken(
  providedUid?: string,
): Promise<string | null> {
  try {
    console.log("🔔 [PushRegistry] Starting push token registration...");

    const perm = await Notifications.getPermissionsAsync();
    console.log("🔔 [PushRegistry] Current permission status:", perm.status);

    if (!perm.granted) {
      console.log("🔔 [PushRegistry] Permission not granted, requesting...");
      const req = await Notifications.requestPermissionsAsync();
      console.log("🔔 [PushRegistry] Permission request result:", req.status);
      if (!req.granted) {
        console.warn("⚠️ [PushRegistry] Permission denied by user");
        return null;
      }
    }

    console.log("🔔 [PushRegistry] Getting Expo push token...");
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    console.log("🔔 [PushRegistry] Project ID:", projectId);

    const expoPushToken = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log("🔔 [PushRegistry] Got push token:", expoPushToken);

    if (!expoPushToken) {
      console.warn("⚠️ [PushRegistry] No push token received");
      return null;
    }

    // Use provided UID first, then fall back to getCurrentUserId()
    const uid = providedUid || getCurrentUserId();
    console.log("🔔 [PushRegistry] User ID (provided:", !!providedUid, "):", uid);

    if (!uid) {
      console.warn(
        "⚠️ [PushRegistry] No user ID - returning token without saving",
      );
      return expoPushToken;
    }

    const deviceId =
      Device.osBuildId ||
      Device.osInternalBuildId ||
      Device.deviceName ||
      `${Platform.OS}-${Date.now()}`;
    console.log("🔔 [PushRegistry] Device ID:", deviceId);

    const record: DeviceRecord = {
      deviceId,
      pushToken: expoPushToken,
      platform: Platform.OS as "ios" | "android" | "web",
      brand: Device.brand ?? null,
      model: Device.modelName ?? null,
      osVersion: Device.osVersion ?? null,
      updatedAt: serverTimestamp(),
    };

    console.log(
      "🔔 [PushRegistry] Saving to Firestore: users/" +
        uid +
        "/devices/" +
        deviceId,
    );
    await setDoc(doc(db, "users", uid, "devices", deviceId), record, {
      merge: true,
    });
    console.log("✅ [PushRegistry] Device registered for push:", record);

    return expoPushToken;
  } catch (e) {
    console.error("❌ [PushRegistry] Failed to register push token:", e);
    return null;
  }
}
