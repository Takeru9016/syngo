import * as admin from "firebase-admin";
import {setGlobalOptions} from "firebase-functions/v2";

// Initialize Firebase Admin
admin.initializeApp();

// Set global options
setGlobalOptions({
  region: "asia-south1", // Change to your preferred region (e.g., "asia-south1" for India)
  maxInstances: 10,
});

// Export all functions
export * from "./triggers/pairing";
export * from "./triggers/notifications";
export * from "./scheduled/cleanup";