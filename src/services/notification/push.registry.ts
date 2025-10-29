import * as Notifications from "expo-notifications";
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

export async function registerDevicePushToken(): Promise<string | null> {
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) {
      const req = await Notifications.requestPermissionsAsync();
      if (!req.granted) return null;
    }

    // Expo push token for dev/testing
    const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
    if (!expoPushToken) return null;

    const uid = getCurrentUserId();
    if (!uid) return expoPushToken;

    const deviceId =
      Device.osBuildId ||
      Device.osInternalBuildId ||
      Device.deviceName ||
      `${Platform.OS}-${Date.now()}`;

    const record: DeviceRecord = {
      deviceId,
      pushToken: expoPushToken,
      platform: Platform.OS as "ios" | "android" | "web",
      brand: Device.brand ?? null,
      model: Device.modelName ?? null,
      osVersion: Device.osVersion ?? null,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", uid, "devices", deviceId), record, {
      merge: true,
    });
    console.log("📱 Device registered for push:", record);

    return expoPushToken;
  } catch (e) {
    console.warn("⚠️ Failed to register push token", e);
    return null;
  }
}
