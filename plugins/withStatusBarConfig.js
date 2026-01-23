const { withInfoPlist } = require("@expo/config-plugins");

/**
 * Expo Config Plugin: Status Bar Configuration
 *
 * Sets UIViewControllerBasedStatusBarAppearance to NO in Info.plist
 * Required for RCTStatusBarManager to work properly.
 */

function withStatusBarConfig(config) {
  return withInfoPlist(config, (config) => {
    // Set to NO to allow RCTStatusBarManager to control status bar
    config.modResults.UIViewControllerBasedStatusBarAppearance = false;

    console.log(
      "✅ [StatusBar Plugin] Set UIViewControllerBasedStatusBarAppearance = NO",
    );

    return config;
  });
}

module.exports = withStatusBarConfig;
