/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  name: "SyngoWidget",
  deploymentTarget: "16.0",
  bundleIdentifier: ".widget",

  // App Groups for shared data
  entitlements: {
    "com.apple.security.application-groups": ["group.com.sahiljadhav.syngo"],
  },

  // Enable WidgetKit
  frameworks: ["WidgetKit", "SwiftUI"],

  // Info.plist additions
  infoPlist: {
    NSExtension: {
      NSExtensionPointIdentifier: "com.apple.widgetkit-extension",
    },
  },
};
