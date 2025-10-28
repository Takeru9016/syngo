import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "./auth/auth.service";
import { UserProfile } from "@/types";
import { CloudinaryStorage } from "./storage/cloudinary.adapter";

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

  console.log("📝 Updating profile with:", updates);

  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Profile updated successfully in Firestore");
  } catch (error: any) {
    console.error("❌ Error updating profile:", error.message);
    throw error;
  }
}

/**
 * Upload avatar and update profile
 */
export async function uploadAvatar(localUri: string): Promise<string> {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("No user ID available");

  console.log("🎯 uploadAvatar called");
  console.log("   User ID:", uid);
  console.log("   Local URI:", localUri);

  try {
    console.log("📤 Step 1: Uploading to Cloudinary...");

    // Upload to Cloudinary FIRST
    const { url } = await CloudinaryStorage.upload(localUri, {
      folder: `notify/avatars/${uid}`,
    });

    console.log("✅ Step 2: Cloudinary upload complete!");
    console.log("   Cloudinary URL:", url);

    // THEN update Firestore with the Cloudinary URL
    console.log("📝 Step 3: Updating Firestore with Cloudinary URL...");
    await updateProfile({ avatarUrl: url });

    console.log("✅ Step 4: Profile updated successfully!");
    console.log("   Final avatar URL:", url);

    return url;
  } catch (error: any) {
    console.error("❌ Error in uploadAvatar:", error.message);
    console.error("❌ Error stack:", error.stack);
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

/**
 * Listen to current user's profile changes in real-time
 * Returns unsubscribe function
 */
export function subscribeToProfile(
  callback: (profile: UserProfile | null) => void
): () => void {
  const uid = getCurrentUserId();
  if (!uid) {
    console.warn("⚠️ Cannot subscribe to profile: User not authenticated");
    return () => {};
  }

  console.log("👂 Subscribing to profile changes for:", uid);

  const unsubscribe = onSnapshot(
    doc(db, "users", uid),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const profile: UserProfile = {
          id: snapshot.id,
          uid: data.uid || uid,
          displayName: data.displayName || "User",
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
          pairId: data.pairId || undefined,
        };
        console.log("📬 Profile updated:", profile);
        callback(profile);
      } else {
        console.log("⚠️ Profile document does not exist");
        callback(null);
      }
    },
    (error) => {
      console.error("❌ Error listening to profile:", error);
      callback(null);
    }
  );

  return unsubscribe;
}

/**
 * Listen to partner's profile changes in real-time
 * Returns unsubscribe function
 */
export function subscribeToPartnerProfile(
  callback: (profile: UserProfile | null) => void
): () => void {
  const uid = getCurrentUserId();
  if (!uid) {
    console.warn("⚠️ Cannot subscribe to partner: User not authenticated");
    return () => {};
  }

  let pairUnsubscribe: (() => void) | null = null;
  let partnerUnsubscribe: (() => void) | null = null;

  // First, listen to own profile to get pairId
  const profileUnsubscribe = onSnapshot(
    doc(db, "users", uid),
    async (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const myProfile = snapshot.data();
      const pairId = myProfile.pairId;

      if (!pairId) {
        console.log("⚠️ User is not paired");
        callback(null);
        return;
      }

      // Listen to pair document to get partner UID
      if (pairUnsubscribe) pairUnsubscribe();
      pairUnsubscribe = onSnapshot(
        doc(db, "pairs", pairId),
        (pairSnapshot) => {
          if (!pairSnapshot.exists()) {
            callback(null);
            return;
          }

          const participants = pairSnapshot.data().participants as [
            string,
            string
          ];
          const partnerUid = participants.find((id) => id !== uid);

          if (!partnerUid) {
            callback(null);
            return;
          }

          // Listen to partner's profile
          if (partnerUnsubscribe) partnerUnsubscribe();
          partnerUnsubscribe = onSnapshot(
            doc(db, "users", partnerUid),
            (partnerSnapshot) => {
              if (!partnerSnapshot.exists()) {
                callback(null);
                return;
              }

              const data = partnerSnapshot.data();
              const partnerProfile: UserProfile = {
                id: partnerSnapshot.id,
                uid: data.uid || partnerUid,
                displayName: data.displayName || "Partner",
                bio: data.bio || "",
                avatarUrl: data.avatarUrl || "",
                pairId: data.pairId || undefined,
              };
              console.log("📬 Partner profile updated:", partnerProfile);
              callback(partnerProfile);
            },
            (error) => {
              console.error("❌ Error listening to partner:", error);
              callback(null);
            }
          );
        },
        (error) => {
          console.error("❌ Error listening to pair:", error);
          callback(null);
        }
      );
    },
    (error) => {
      console.error("❌ Error listening to profile:", error);
      callback(null);
    }
  );

  // Return cleanup function that unsubscribes all listeners
  return () => {
    console.log("🔇 Cleaning up partner profile listener");
    profileUnsubscribe();
    if (pairUnsubscribe) pairUnsubscribe();
    if (partnerUnsubscribe) partnerUnsubscribe();
  };
}
