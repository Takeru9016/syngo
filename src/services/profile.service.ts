import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "./auth/auth.service";
import { UserProfile } from "@/types";

/**
 * Get user profile from Firestore
 */
export async function getProfile(): Promise<UserProfile | null> {
  const uid = getCurrentUserId();
  if (!uid) {
    console.error("❌ No user ID available");
    return null;
  }

  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        uid: data.uid || uid,
        displayName: data.displayName || "User",
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || "",
        pairId: data.pairId || undefined,
      };
    } else {
      // Create default profile if doesn't exist
      console.log("📝 Creating default profile...");
      const defaultProfile: Omit<UserProfile, "id"> = {
        uid,
        displayName: "User",
        bio: "",
        avatarUrl: "",
      };
      await createProfile(defaultProfile);
      return { id: uid, ...defaultProfile };
    }
  } catch (error: any) {
    console.error("❌ Error getting profile:", error.message);
    throw error;
  }
}

/**
 * Create user profile in Firestore
 */
export async function createProfile(
  profile: Omit<UserProfile, "id">
): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("No user ID available");

  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, {
      uid: profile.uid,
      displayName: profile.displayName,
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
      pairId: profile.pairId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Profile created successfully");
  } catch (error: any) {
    console.error("❌ Error creating profile:", error.message);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  updates: Partial<Omit<UserProfile, "id" | "uid">>
): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("No user ID available");

  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Profile updated successfully");
  } catch (error: any) {
    console.error("❌ Error updating profile:", error.message);
    throw error;
  }
}

/**
 * Get partner profile
 * Uses the pairId from current user's profile to find partner
 */
export async function getPartnerProfile(): Promise<UserProfile | null> {
  const uid = getCurrentUserId();
  if (!uid) {
    console.log("⚠️ No user authenticated");
    return null;
  }

  try {
    // Get current user's profile to find pairId
    const myProfile = await getProfile();
    if (!myProfile?.pairId) {
      console.log("⚠️ User is not paired");
      return null;
    }

    // Get the pair document
    const pairDoc = await getDoc(doc(db, "pairs", myProfile.pairId));
    if (!pairDoc.exists()) {
      console.log("⚠️ Pair document not found");
      return null;
    }

    // Find partner's UID
    const participants = pairDoc.data().participants as [string, string];
    const partnerUid = participants.find((id) => id !== uid);

    if (!partnerUid) {
      console.log("⚠️ Partner UID not found");
      return null;
    }

    // Get partner's profile
    const partnerDoc = await getDoc(doc(db, "users", partnerUid));
    if (!partnerDoc.exists()) {
      console.log("⚠️ Partner profile not found");
      return null;
    }

    const data = partnerDoc.data();
    return {
      id: partnerDoc.id,
      uid: data.uid || partnerUid,
      displayName: data.displayName || "Partner",
      bio: data.bio || "",
      avatarUrl: data.avatarUrl || "",
      pairId: data.pairId || undefined,
    };
  } catch (error: any) {
    console.error("❌ Error getting partner profile:", error.message);
    return null;
  }
}
