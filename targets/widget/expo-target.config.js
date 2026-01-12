/** @type {import('@bacons/apple-targets').ConfigPlugin} */
module.exports = {
  type: "widget",
  name: "SyngoWidget",
  bundleIdentifier: ".widget",
  deploymentTarget: "17.0",
  frameworks: ["WidgetKit", "SwiftUI"],
  entitlements: {
    "com.apple.security.application-groups": ["group.com.sahiljadhav.syngo"],
  },
  // Colors from Syngo theme
  colors: {
    $accent: { light: "#6366F1", dark: "#818CF8" },
    $background: { light: "#FFFFFF", dark: "#050816" },
    $widgetBackground: { light: "#F8F5F2", dark: "#0A0F1C" },
  },
};
