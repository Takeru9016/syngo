#!/usr/bin/env node

/**
 * Version Bump Script
 *
 * Interactive script to bump app version before production builds.
 * Updates version in app.config.ts, package.json, and build numbers.
 *
 * Usage: npm run version:bump
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const APP_CONFIG_PATH = path.join(__dirname, "../app.config.ts");
const PACKAGE_JSON_PATH = path.join(__dirname, "../package.json");

// ANSI colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log();
  log(`━━━ ${message} ━━━`, colors.cyan + colors.bright);
  console.log();
}

/**
 * Parse semantic version string
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Bump version based on type
 */
function bumpVersion(current, type) {
  const parsed = parseVersion(current);

  switch (type) {
    case "major":
      return `${parsed.major + 1}.0.0`;
    case "minor":
      return `${parsed.major}.${parsed.minor + 1}.0`;
    case "patch":
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${type}`);
  }
}

/**
 * Extract current version from app.config.ts
 */
function getCurrentVersion() {
  const content = fs.readFileSync(APP_CONFIG_PATH, "utf-8");

  // Extract version
  const versionMatch = content.match(/version:\s*["'](\d+\.\d+\.\d+)["']/);
  if (!versionMatch) {
    throw new Error("Could not find version in app.config.ts");
  }

  // Extract iOS buildNumber
  const buildNumberMatch = content.match(/buildNumber:\s*["'](\d+)["']/);

  // Extract Android versionCode
  const versionCodeMatch = content.match(/versionCode:\s*(\d+)/);

  return {
    version: versionMatch[1],
    buildNumber: buildNumberMatch ? parseInt(buildNumberMatch[1], 10) : 1,
    versionCode: versionCodeMatch ? parseInt(versionCodeMatch[1], 10) : 1,
  };
}

/**
 * Update version in app.config.ts
 */
function updateAppConfig(newVersion, newBuildNumber) {
  let content = fs.readFileSync(APP_CONFIG_PATH, "utf-8");

  // Update version
  content = content.replace(
    /version:\s*["']\d+\.\d+\.\d+["']/,
    `version: "${newVersion}"`
  );

  // Update iOS buildNumber
  content = content.replace(
    /buildNumber:\s*["']\d+["']/,
    `buildNumber: "${newBuildNumber}"`
  );

  // Update Android versionCode
  content = content.replace(
    /versionCode:\s*\d+/,
    `versionCode: ${newBuildNumber}`
  );

  // Update appVersion in extra
  content = content.replace(
    /appVersion:\s*["']\d+\.\d+\.\d+["']/,
    `appVersion: "${newVersion}"`
  );

  // Update appBuildNumber in extra
  content = content.replace(
    /appBuildNumber:\s*["']\d+["']/,
    `appBuildNumber: "${newBuildNumber}"`
  );

  fs.writeFileSync(APP_CONFIG_PATH, content, "utf-8");
}

/**
 * Update version in package.json
 */
function updatePackageJson(newVersion) {
  const content = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
  content.version = newVersion;
  fs.writeFileSync(
    PACKAGE_JSON_PATH,
    JSON.stringify(content, null, 2) + "\n",
    "utf-8"
  );
}

/**
 * Create readline interface for user input
 */
function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask user a question and get response
 */
function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Main function
 */
async function main() {
  logHeader("Syngo Version Bump");

  const rl = createPrompt();

  try {
    // Get current versions
    const current = getCurrentVersion();

    log(`Current version: ${colors.bright}${current.version}${colors.reset}`);
    log(
      `Build number:    ${colors.bright}${current.buildNumber}${colors.reset}`
    );
    console.log();

    // Show bump options
    log("What type of version bump?", colors.yellow);
    console.log();
    log(
      `  ${colors.bright}1${colors.reset} / ${colors.bright}patch${colors.reset}  → ${bumpVersion(current.version, "patch")}  (bug fixes, small changes)`
    );
    log(
      `  ${colors.bright}2${colors.reset} / ${colors.bright}minor${colors.reset}  → ${bumpVersion(current.version, "minor")}  (new features, backwards compatible)`
    );
    log(
      `  ${colors.bright}3${colors.reset} / ${colors.bright}major${colors.reset}  → ${bumpVersion(current.version, "major")}  (breaking changes)`
    );
    log(
      `  ${colors.bright}4${colors.reset} / ${colors.bright}build${colors.reset}  → ${current.version}  (bump build number only)`
    );
    log(`  ${colors.dim}q / quit   → cancel${colors.reset}`);
    console.log();

    const choice = await ask(rl, `${colors.cyan}Enter choice: ${colors.reset}`);

    let newVersion = current.version;
    let newBuildNumber = current.buildNumber;
    let bumpType = "";

    switch (choice) {
      case "1":
      case "patch":
      case "p":
        newVersion = bumpVersion(current.version, "patch");
        newBuildNumber = current.buildNumber + 1;
        bumpType = "patch";
        break;
      case "2":
      case "minor":
      case "m":
        newVersion = bumpVersion(current.version, "minor");
        newBuildNumber = current.buildNumber + 1;
        bumpType = "minor";
        break;
      case "3":
      case "major":
        newVersion = bumpVersion(current.version, "major");
        newBuildNumber = current.buildNumber + 1;
        bumpType = "major";
        break;
      case "4":
      case "build":
      case "b":
        newBuildNumber = current.buildNumber + 1;
        bumpType = "build";
        break;
      case "q":
      case "quit":
      case "exit":
        log("\nCancelled. No changes made.", colors.dim);
        rl.close();
        return;
      default:
        log(`\n❌ Invalid choice: "${choice}"`, colors.red);
        rl.close();
        process.exit(1);
    }

    console.log();
    log("Preview changes:", colors.yellow);
    log(
      `  Version:      ${current.version} → ${colors.green}${newVersion}${colors.reset}`
    );
    log(
      `  Build number: ${current.buildNumber} → ${colors.green}${newBuildNumber}${colors.reset}`
    );
    console.log();

    const confirm = await ask(
      rl,
      `${colors.cyan}Apply these changes? (y/n): ${colors.reset}`
    );

    if (confirm !== "y" && confirm !== "yes") {
      log("\nCancelled. No changes made.", colors.dim);
      rl.close();
      return;
    }

    // Apply changes
    console.log();
    log("Updating files...", colors.dim);

    updateAppConfig(newVersion, newBuildNumber);
    log(`  ✓ Updated app.config.ts`, colors.green);

    updatePackageJson(newVersion);
    log(`  ✓ Updated package.json`, colors.green);

    console.log();
    log(
      `✅ Version bumped to ${colors.bright}${newVersion}${colors.reset} (build ${newBuildNumber})`,
      colors.green
    );
    console.log();

    // Show next steps
    log("Next steps:", colors.yellow);
    log(`  1. Review changes: ${colors.dim}git diff${colors.reset}`);
    log(
      `  2. Commit: ${colors.dim}git commit -am "chore: bump version to ${newVersion}"${colors.reset}`
    );
    log(
      `  3. Build: ${colors.dim}npm run build:prod${colors.reset}`
    );
    console.log();

    rl.close();
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.red);
    rl.close();
    process.exit(1);
  }
}

main();
