import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";

// Define secrets for push notifications
// This must be exported and used in function options for the secret to be available
export const expoAccessToken = defineSecret("EXPO_ACCESS_TOKEN");

// Initialize Firebase Admin
admin.initializeApp();

// Set global options
// Note: Secrets are declared per-function, not globally
// Each function that needs the secret must declare it
setGlobalOptions({
  region: "asia-south1", // Change to your preferred region (e.g., "asia-south1" for India)
  maxInstances: 10,
});

// Export all functions
export * from "./pairing/generateCode";
export * from "./notifications/onTodoCreated";
export * from "./notifications/onTodoUpdated";
export * from "./notifications/onTodoDeleted";
export * from "./notifications/onStickerSent";
export * from "./notifications/onFavoriteAdded";
export * from "./notifications/onNotificationCreated";
export * from "./scheduled/cleanup";
export * from "./scheduled/todoDueReminders";
export * from "./notifications/onMoodUpdated";
