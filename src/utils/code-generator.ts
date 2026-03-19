/**
 * Generate a random alphanumeric code
 * @param length - Length of the code (default: 6)
 * @returns Random code (e.g., "AB1-2CD")
 */
export function generateRandomCode(length: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars (0, O, I, 1)
  const blacklist = [
    "69",
    "420",
    "SEX",
    "FUC",
    "SHI",
    "BIC",
    "DIK",
    "ASS",
    "CUM",
    "TIT",
    "VAG",
    "KYS",
    "NIG",
    "FAG",
    "GAY",
    "JEW",
    "KKK",
  ];

  let attempts = 0;
  while (attempts < 50) {
    let code = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    // Check if code contains any blacklisted substring
    const isClean = !blacklist.some((badWord) => code.includes(badWord));
    if (isClean) {
      return code;
    }
    attempts++;
  }

  // Fallback if somehow we hit the attempt limit (extremely unlikely)
  return "ABCDEF".substring(0, length);
}

/**
 * Format code with hyphen for display (e.g., "AB1-2CD")
 * @param code - Raw code string
 * @returns Formatted code
 */
export function formatCode(code: string): string {
  // AB12CD -> AB1-2CD
  if (code.length === 6) {
    return `${code.slice(0, 3)}-${code.slice(3)}`;
  }
  return code;
}

/**
 * Remove formatting from code (e.g., "AB12-CD34" -> "AB12CD34")
 * @param code - Formatted code string
 * @returns Raw code
 */
export function unformatCode(code: string): string {
  // AB12-CD34 -> AB12CD34
  // Remove all non-alphanumeric characters
  return code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
}

/**
 * Validate code format
 * @param code - Code to validate
 * @returns True if valid format
 */
export function isValidCodeFormat(code: string): boolean {
  const rawCode = unformatCode(code);
  return /^[A-Z0-9]{6}$/.test(rawCode);
}
