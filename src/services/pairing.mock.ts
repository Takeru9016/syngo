// Mock service with deterministic behavior. Replace with Firebase in Phase 2.
export type GeneratedCode = { code: string; expiresAt: number };

const CODE_TTL_MS = 10 * 60 * 1000;

export function generateCode(now = Date.now()): GeneratedCode {
  // 6 digits numeric to match sample
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + CODE_TTL_MS;
  return { code, expiresAt };
}

export async function shareCode(): Promise<GeneratedCode> {
  await delay(300);
  return generateCode();
}

export type RedeemResult =
  | { ok: true; pairId: string }
  | {
      ok: false;
      reason: "invalid" | "expired" | "already_paired" | "rate_limited";
    };

export async function redeemCode(input: string): Promise<RedeemResult> {
  await delay(400);
  const trimmed = input.replace(/\D/g, "");
  if (trimmed.length !== 6) return { ok: false, reason: "invalid" };

  const clean = input.replace(/\D/g, "");

  if (clean.length !== 6) {
    return { ok: false, reason: "invalid" };
  }

  // Test specific codes for different errors
  if (clean === "111111") {
    return { ok: false, reason: "expired" };
  }

  if (clean === "222222") {
    return { ok: false, reason: "already_paired" };
  }

  if (clean === "333333") {
    return { ok: false, reason: "rate_limited" };
  }

  // Mock: last digit decides outcome to help QA states
  const last = Number(trimmed[5]);
  if (last === 0) return { ok: false, reason: "expired" };
  if (last === 1) return { ok: false, reason: "already_paired" };
  if (last === 2) return { ok: false, reason: "rate_limited" };

  // success
  const pairId = `pair_${trimmed}_${Date.now()}`;
  return { ok: true, pairId };
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
