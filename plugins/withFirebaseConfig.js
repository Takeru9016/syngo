const {
  withDangerousMod,
  withPlugins,
  IOSConfig,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo Config Plugin: Firebase Configuration
 *
 * Automatically copies Firebase configuration files during prebuild:
 * - google-services.json → android/app/
 * - GoogleService-Info.plist → ios/<appName>/
 *
 * This allows using CNG (Continuous Native Generation) workflow
 * where android/ and ios/ folders are gitignored.
 */

function withFirebaseAndroid(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const sourceFile = path.join(
        projectRoot,
        "firebase",
        "google-services.json",
      );
      const destinationDir = path.join(projectRoot, "android", "app");
      const destinationFile = path.join(destinationDir, "google-services.json");

      if (fs.existsSync(sourceFile)) {
        // Ensure destination directory exists
        if (!fs.existsSync(destinationDir)) {
          fs.mkdirSync(destinationDir, { recursive: true });
        }

        // Copy google-services.json
        fs.copyFileSync(sourceFile, destinationFile);
        console.log(
          "✅ [Firebase Plugin] Copied google-services.json to android/app/",
        );
      } else {
        console.warn(
          "⚠️ [Firebase Plugin] firebase/google-services.json not found",
        );
      }

      return config;
    },
  ]);
}

function withFirebaseIos(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const projectName =
        config.modRequest.projectName ||
        IOSConfig.XcodeUtils.getProjectName(projectRoot);

      const sourceFile = path.join(
        projectRoot,
        "firebase",
        "GoogleService-Info.plist",
      );
      const destinationDir = path.join(projectRoot, "ios", projectName);
      const destinationFile = path.join(
        destinationDir,
        "GoogleService-Info.plist",
      );

      if (fs.existsSync(sourceFile)) {
        // Ensure destination directory exists
        if (!fs.existsSync(destinationDir)) {
          fs.mkdirSync(destinationDir, { recursive: true });
        }

        // Copy GoogleService-Info.plist
        fs.copyFileSync(sourceFile, destinationFile);
        console.log(
          "✅ [Firebase Plugin] Copied GoogleService-Info.plist to ios/" +
            projectName +
            "/",
        );
      } else {
        console.warn(
          "⚠️ [Firebase Plugin] firebase/GoogleService-Info.plist not found",
        );
      }

      return config;
    },
  ]);
}

function withFirebaseConfig(config) {
  return withPlugins(config, [withFirebaseAndroid, withFirebaseIos]);
}

module.exports = withFirebaseConfig;
