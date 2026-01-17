import "dotenv/config";
import type { ExpoConfig } from "@expo/config";

const EAS_PROJECT_ID = "0f6d9962-45d9-4648-bc14-54362c3f999e";

const config: ExpoConfig = {
  name: "Syngo",
  slug: "notify",
  version: "1.2.1",
  orientation: "portrait",
  scheme: "syngo",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  // App description and metadata
  description:
    "A calm shared space just for two. Stay in sync with shared todos, reminders, and small moments that matter. No feeds, no noise—just the two of you.",

  icon: "./assets/images/icon.png",

  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#050816",
  },

  ios: {
    bundleIdentifier: "com.sahiljadhav.syngo",
    buildNumber: "1",
    supportsTablet: false, // Portrait-only app
    appleTeamId: "3RNFFHNH54", // Required for @bacons/apple-targets widgets

    // App Store metadata
    appStoreUrl: "https://apps.apple.com/in/app/syngo/id6755762478",

    // App Groups for widget data sharing
    entitlements: {
      "com.apple.security.application-groups": ["group.com.sahiljadhav.syngo"],
    },

    infoPlist: {
      // Background modes for notifications
      UIBackgroundModes: ["remote-notification"],
      ITSAppUsesNonExemptEncryption: false,

      // Privacy - Photo Library
      NSPhotoLibraryUsageDescription:
        "Syngo needs access to your photo library so you can upload stickers and images to share with your partner.",
      NSPhotoLibraryAddUsageDescription:
        "Syngo needs permission to save images to your photo library.",

      // Privacy - Camera
      NSCameraUsageDescription:
        "Syngo needs camera access so you can take photos for stickers and images to share with your partner.",

      // Privacy - Notifications (iOS 10+)
      // This is implicit with expo-notifications, but good to document

      // Prevent App Tracking Transparency prompt (you don't track)
      // If you add analytics later that Apple considers "tracking", you'll need NSUserTrackingUsageDescription

      // Localization
      CFBundleDevelopmentRegion: "en",
      CFBundleAllowMixedLocalizations: true,

      // Status bar
      UIStatusBarStyle: "UIStatusBarStyleDefault",
      UIViewControllerBasedStatusBarAppearance: true,

      // Disable iTunes file sharing (privacy)
      UIFileSharingEnabled: false,

      // Require full screen (no split view on iPad, though you disabled tablet)
      UIRequiresFullScreen: true,
    },

    // Associated domains for universal links (if you add deep linking later)
    // associatedDomains: ["applinks:syngo.app"],
  },

  android: {
    package: "com.sahiljadhav.syngo",
    versionCode: 1,

    // Play Store metadata
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.sahiljadhav.syngo", // Will be filled after app is live

    adaptiveIcon: {
      backgroundColor: "#050816",
      foregroundImage: "./assets/images/icon.png", // My gradient pill icon
    },

    permissions: [
      // Required
      "INTERNET",
      "ACCESS_NETWORK_STATE",

      // Notifications (Android 13+)
      "android.permission.POST_NOTIFICATIONS",

      // Vibration for haptics
      "VIBRATE",

      // Keep device awake for notifications
      "WAKE_LOCK",

      // Boot receiver (for scheduled notifications)
      "android.permission.RECEIVE_BOOT_COMPLETED",

      // Camera and storage (for stickers/images)
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",

      // Media (Android 13+ granular permissions)
      "READ_MEDIA_IMAGES",
    ],

    // Blocking permissions (explicitly state you DON'T need these - helps with Play Store review)
    blockedPermissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "BLUETOOTH",
      "BLUETOOTH_ADMIN",
      "RECORD_AUDIO",
    ],
  },

  web: {
    output: "static",
    favicon: "./assets/images/icon.png",
    bundler: "metro",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#050816",
      },
    ],

    [
      "expo-image-picker",
      {
        photosPermission:
          "Syngo needs access to your photo library so you can upload stickers and images to share with your partner.",
        cameraPermission:
          "Syngo needs camera access so you can take photos for stickers and images to share with your partner.",
        microphonePermission: false,
      },
    ],

    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png", // 96×96 transparent PNG with white icon
        color: "#6366F1", // My primary indigo color
        mode: "production",
        sounds: ["./assets/sounds/notification.mp3"], // Custom notification sound
      },
    ],

    [
      "@sentry/react-native/expo",
      {
        url: process.env.SENTRY_URL || "https://sentry.io/",
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
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
    cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UNSIGNED_PRESET,

    // App metadata (accessible via Constants.expoConfig.extra)
    appVersion: "1.2.1",
    appBuildNumber: "1",
    supportEmail: "timetocode22@gmail.com",
    privacyPolicyUrl: "https://syngo.vercel.app/privacy",
    termsOfServiceUrl: "https://syngo.vercel.app/eula",
    websiteUrl: "https://syngo.vercel.app/",
  },

  // Update configuration (for OTA updates via EAS Update)
  updates: {
    enabled: true,
    fallbackToCacheTimeout: 0,
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
  },

  runtimeVersion: {
    policy: "appVersion", // or "sdkVersion" or "nativeVersion"
  },
};

export default config;
