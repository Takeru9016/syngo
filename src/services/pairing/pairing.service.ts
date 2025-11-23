import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  writeBatch,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "@/services/auth/auth.service";
import { getProfile, updateProfile } from "@/services/profile/profile.service";
import { PairCode, Pair, UserProfile } from "@/types";
import { generateRandomCode, unformatCode } from "@/utils/code-generator";

// Constants
const CODE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CODE_GENERATION_ATTEMPTS = 5;

// Types
export type PairCodeResult = {
  code: string;
  expiresAt: number;
};

export type ValidationResult = {
  valid: boolean;
  error?:
    | "not_found"
    | "expired"
    | "already_used"
    | "own_code"
    | "already_paired";
  ownerUid?: string;
};

export type PairResult = {
  pairId: string;
  partnerUid: string;
  partnerProfile: UserProfile;
};

/**
 * Generate a new pair code
 */
export async function generatePairCode(): Promise<PairCodeResult> {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("User not authenticated");

  // Check if user is already paired
  const profile = await getProfile();
  if (profile?.pairId) {
    throw new Error("already_paired");
  }

  // Delete any existing codes for this user
  await deleteUserCodes(uid);

  // Generate unique code
  let code: string = "";
  let attempts = 0;

  while (attempts < MAX_CODE_GENERATION_ATTEMPTS) {
    code = generateRandomCode(8);
    const codeDoc = await getDoc(doc(db, "pairCodes", code));

    if (!codeDoc.exists()) {
      break; // Code is unique
    }

    attempts++;
  }

  if (attempts >= MAX_CODE_GENERATION_ATTEMPTS) {
    throw new Error("Failed to generate unique code. Please try again.");
  }

  // Create code document
  const expiresAt = Date.now() + CODE_EXPIRATION_MS;
  const pairCodeData: Omit<PairCode, "pairId"> & { pairId: null } = {
    code,
    ownerUid: uid,
    expiresAt,
    createdAt: Date.now(),
    used: false,
    pairId: null,
  };

  await setDoc(doc(db, "pairCodes", code), {
    ...pairCodeData,
    expiresAt: Timestamp.fromMillis(expiresAt),
    createdAt: serverTimestamp(),
  });

  console.log("✅ Pair code generated:", code);

  return {
    code,
    expiresAt,
  };
}

/**
 * Validate a pair code
 */
export async function validatePairCode(
  code: string
): Promise<ValidationResult> {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("User not authenticated");

  // Normalize code
  const normalizedCode = unformatCode(code);

  // Check if user is already paired
  const profile = await getProfile();
  if (profile?.pairId) {
    return { valid: false, error: "already_paired" };
  }

  // Get code document
  const codeDoc = await getDoc(doc(db, "pairCodes", normalizedCode));

  if (!codeDoc.exists()) {
    return { valid: false, error: "not_found" };
  }

  const codeData = codeDoc.data();
  const expiresAt = codeData.expiresAt?.toMillis() || 0;

  // Check if it's the user's own code
  if (codeData.ownerUid === uid) {
    return { valid: false, error: "own_code" };
  }

  // Check if expired
  if (Date.now() > expiresAt) {
    return { valid: false, error: "expired" };
  }

  // Check if already used
  if (codeData.used) {
    return { valid: false, error: "already_used" };
  }

  return { valid: true, ownerUid: codeData.ownerUid };
}

/**
 * Redeem a pair code and create a pair
 */
export async function redeemPairCode(code: string): Promise<PairResult> {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("User not authenticated");

  // Normalize code
  const normalizedCode = unformatCode(code);

  // Validate code
  const validation = await validatePairCode(normalizedCode);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid code");
  }

  const ownerUid = validation.ownerUid!;

  try {
    // Step 1: Create pair document first
    const pairRef = doc(collection(db, "pairs"));
    const pairId = pairRef.id;

    await setDoc(pairRef, {
      participants: [uid, ownerUid],
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Pair document created:", pairId);

    // Step 2: Update current user's profile
    await updateDoc(doc(db, "users", uid), {
      pairId,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Current user profile updated");

    // Step 3: Update partner's profile
    await updateDoc(doc(db, "users", ownerUid), {
      pairId,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Partner profile updated");

    // Step 4: Mark code as used
    await updateDoc(doc(db, "pairCodes", normalizedCode), {
      used: true,
      pairId,
    });

    console.log("✅ Code marked as used");
    console.log("✅ Pair created successfully:", pairId);

    // Get partner profile
    const partnerDoc = await getDoc(doc(db, "users", ownerUid));
    const partnerData = partnerDoc.data();
    const partnerProfile: UserProfile = {
      id: partnerDoc.id,
      uid: partnerData?.uid || ownerUid,
      displayName: partnerData?.displayName || "Partner",
      bio: partnerData?.bio || "",
      avatarUrl: partnerData?.avatarUrl || "",
      pairId,
    };

    return {
      pairId,
      partnerUid: ownerUid,
      partnerProfile,
    };
  } catch (error: any) {
    console.error("❌ Error during pairing:", error);
    // If anything fails, we should ideally clean up, but for now just throw
    throw error;
  }
}

/**
 * Get current user's active pair code
 */
export async function getActiveCode(): Promise<PairCodeResult | null> {
  const uid = getCurrentUserId();
  if (!uid) return null;

  try {
    const q = query(
      collection(db, "pairCodes"),
      where("ownerUid", "==", uid),
      where("used", "==", false)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    // Get the most recent code
    const codes = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          code: data.code,
          expiresAt: data.expiresAt?.toMillis() || 0,
        };
      })
      .filter((code) => code.expiresAt > Date.now()) // Filter expired
      .sort((a, b) => b.expiresAt - a.expiresAt); // Sort by expiration (newest first)

    return codes[0] || null;
  } catch (error: any) {
    console.error("❌ Error getting active code:", error.message);
    return null;
  }
}

/**
 * Get current pair information
 */
export async function getCurrentPair(): Promise<
  (Pair & { users: UserProfile[] }) | null
> {
  const uid = getCurrentUserId();
  if (!uid) return null;

  try {
    const profile = await getProfile();
    if (!profile?.pairId) {
      return null;
    }

    const pairDoc = await getDoc(doc(db, "pairs", profile.pairId));
    if (!pairDoc.exists()) {
      return null;
    }

    const pairData = pairDoc.data();
    const participants = pairData.participants as [string, string];

    // Get both user profiles
    const userProfiles = await Promise.all(
      participants.map(async (userId) => {
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.data();
        return {
          id: userDoc.id,
          uid: userData?.uid || userId,
          displayName: userData?.displayName || "User",
          bio: userData?.bio || "",
          avatarUrl: userData?.avatarUrl || "",
          pairId: userData?.pairId || undefined,
        } as UserProfile;
      })
    );

    return {
      id: pairDoc.id,
      participants,
      status: pairData.status,
      createdAt: pairData.createdAt?.toMillis() || Date.now(),
      users: userProfiles,
    };
  } catch (error: any) {
    console.error("❌ Error getting current pair:", error.message);
    return null;
  }
}

/**
 * Unpair from current partner
 */
export async function unpair(): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("User not authenticated");

  const profile = await getProfile();
  if (!profile?.pairId) {
    console.log("⚠️ User is not paired");
    return;
  }

  const pairId = profile.pairId;

  // Get pair document to find both participants
  const pairDoc = await getDoc(doc(db, "pairs", pairId));
  if (!pairDoc.exists()) {
    console.log("⚠️ Pair document not found");
    // Clean up user profile anyway
    await updateProfile({ pairId: undefined, showOnboardingAfterUnpair: true });
    return;
  }

  const participants = pairDoc.data().participants as [string, string];
  const batch = writeBatch(db);

  // Delete pair document
  batch.delete(doc(db, "pairs", pairId));

  // Update both user profiles: clear pairId + set onboarding flag
  participants.forEach((userId) => {
    batch.update(doc(db, "users", userId), {
      pairId: null,
      showOnboardingAfterUnpair: true, // NEW: both users see onboarding
      updatedAt: serverTimestamp(),
    });
  });

  // Commit batch
  await batch.commit();

  console.log("✅ Unpaired successfully, both users will see onboarding");
}

/**
 * Delete all codes for a user
 */
async function deleteUserCodes(uid: string): Promise<void> {
  try {
    const q = query(collection(db, "pairCodes"), where("ownerUid", "==", uid));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    if (!snapshot.empty) {
      await batch.commit();
      console.log("🗑️ Deleted old codes");
    }
  } catch (error: any) {
    console.error("❌ Error deleting user codes:", error.message);
  }
}

/**
 * Clean up expired codes (optional - can be run periodically)
 */
export async function cleanupExpiredCodes(): Promise<void> {
  try {
    const q = query(collection(db, "pairCodes"), where("used", "==", false));

    const snapshot = await getDocs(q);
    const now = Date.now();
    const batch = writeBatch(db);
    let count = 0;

    snapshot.docs.forEach((doc) => {
      const expiresAt = doc.data().expiresAt?.toMillis() || 0;
      if (now > expiresAt) {
        batch.delete(doc.ref);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`🗑️ Cleaned up ${count} expired codes`);
    }
  } catch (error: any) {
    console.error("❌ Error cleaning up expired codes:", error.message);
  }
}
