import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  Auth,
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  Firestore,
  memoryLocalCache,
} from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration type
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Get Firebase config from environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
};

// Validate config
const requiredKeys: (keyof FirebaseConfig)[] = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    throw new Error(`Missing Firebase config: ${key}`);
  }
}

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with AsyncStorage persistence (React Native way)
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Auth already initialized
  auth = getAuth(app);
}

// Initialize Firestore with new cache API (no deprecation warning)
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
  });
} catch (error) {
  // Firestore already initialized
  db = getFirestore(app);
}

// Initialize Storage
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };

// Helper to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return getApps().length > 0;
};

// Export config for debugging (remove in production)
export const getFirebaseConfig = (): {
  projectId: string;
  authDomain: string;
} | null => {
  if (__DEV__) {
    return {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    };
  }
  return null;
};
