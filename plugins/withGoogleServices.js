const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require("@expo/config-plugins");

/**
 * Expo Config Plugin: Google Services
 *
 * Adds Google Services plugin to Android build configuration:
 * - Adds classpath to project build.gradle
 * - Applies plugin in app/build.gradle
 *
 * Required for Firebase to auto-initialize on Android.
 */

const GOOGLE_SERVICES_VERSION = "4.4.2";
const CLASSPATH_LINE = `        classpath('com.google.gms:google-services:${GOOGLE_SERVICES_VERSION}')`;
const APPLY_PLUGIN_LINE = `apply plugin: "com.google.gms.google-services"`;

function withGoogleServicesProjectGradle(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let contents = config.modResults.contents;

      // Check if already added
      if (contents.includes("com.google.gms:google-services")) {
        console.log(
          "ℹ️ [Google Services] classpath already exists in project build.gradle",
        );
        return config;
      }

      // Find the dependencies block and add classpath
      const dependenciesRegex =
        /(dependencies\s*\{[^}]*)(classpath\(['"]['"]?com\.facebook\.react:react-native-gradle-plugin['"]['"]?\))/;

      if (dependenciesRegex.test(contents)) {
        contents = contents.replace(
          dependenciesRegex,
          `$1$2\n${CLASSPATH_LINE}`,
        );
        console.log(
          "✅ [Google Services] Added classpath to project build.gradle",
        );
      } else {
        // Fallback: add after kotlin plugin classpath
        const kotlinRegex =
          /(classpath\(['"]['"]?org\.jetbrains\.kotlin:kotlin-gradle-plugin['"]['"]?\))/;
        if (kotlinRegex.test(contents)) {
          contents = contents.replace(kotlinRegex, `$1\n${CLASSPATH_LINE}`);
          console.log(
            "✅ [Google Services] Added classpath to project build.gradle (after Kotlin)",
          );
        } else {
          console.warn(
            "⚠️ [Google Services] Could not find insertion point in project build.gradle",
          );
        }
      }

      config.modResults.contents = contents;
    }
    return config;
  });
}

function withGoogleServicesAppGradle(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let contents = config.modResults.contents;

      // Check if already added
      if (contents.includes('apply plugin: "com.google.gms.google-services"')) {
        console.log(
          "ℹ️ [Google Services] plugin already applied in app/build.gradle",
        );
        return config;
      }

      // Add plugin after other apply plugin lines
      const reactPluginRegex = /(apply plugin: "com\.facebook\.react")/;

      if (reactPluginRegex.test(contents)) {
        contents = contents.replace(
          reactPluginRegex,
          `$1\n${APPLY_PLUGIN_LINE}`,
        );
        console.log("✅ [Google Services] Applied plugin in app/build.gradle");
      } else {
        console.warn(
          "⚠️ [Google Services] Could not find react plugin in app/build.gradle",
        );
      }

      config.modResults.contents = contents;
    }
    return config;
  });
}

function withGoogleServices(config) {
  config = withGoogleServicesProjectGradle(config);
  config = withGoogleServicesAppGradle(config);
  return config;
}

module.exports = withGoogleServices;
