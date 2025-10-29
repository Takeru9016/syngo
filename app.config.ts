import "dotenv/config";
import type { ExpoConfig } from "@expo/config";

const config: ExpoConfig = {
  name: "notify",
  slug: "notify",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "notify",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  icon: "./assets/images/icon.png",

  ios: {
    supportsTablet: true,
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
  },

  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    permissions: [
      'INTERNET',
      'VIBRATE',
      'WAKE_LOCK',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
  },

  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffff",
        dark: { backgroundColor: "#0000" },
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow Notify to access your photos to upload avatars and stickers.",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png", // optional, 96x96 transparent png
        color: "#4F46E5",
        mode: "production",
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    // Inject your EAS project id here. Prefer setting via env:
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
    // Firebase config from environment variables
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UNSIGNED_PRESET:
      process.env.EXPO_PUBLIC_CLOUDINARY_UNSIGNED_PRESET,
  },
};

export default config;
