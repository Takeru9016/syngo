import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";

import { db, auth } from "@/config/firebase";
import { UserProfile } from "@/types";
import { getCurrentUserId } from "@/services/auth/auth.service";
import { CloudinaryStorage } from "@/services/storage/cloudinary.adapter";

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
        showOnboardingAfterUnpair: data.showOnboardingAfterUnpair, // ADD THIS LINE
      };
    } else {
      // Create default profile if doesn't exist

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
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

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

  try {
    // Upload to Cloudinary FIRST
    const { url } = await CloudinaryStorage.upload(localUri, {
      folder: `notify/avatars/${uid}`,
    });

    // THEN update Firestore with the Cloudinary URL
    await updateProfile({ avatarUrl: url });

    return url;
  } catch (error: any) {
    console.error("❌ Error in uploadAvatar:", error.message);
    throw error;
  }
}

/**
 * Update any user's profile (admin/system use)
 * Used during unpair to set flags for both users
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, "id" | "uid">>
): Promise<void> {


  try {
    const docRef = doc(db, "users", uid);
    await setDoc(
      docRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

  } catch (error: any) {
    console.error(`❌ Error updating profile for user ${uid}:`, error.message);
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

    return null;
  }

  try {
    // Get current user's profile to find pairId
    const myProfile = await getProfile();
    if (!myProfile?.pairId) {

      return null;
    }

    // Get the pair document
    const pairDoc = await getDoc(doc(db, "pairs", myProfile.pairId));
    if (!pairDoc.exists()) {

      return null;
    }

    // Find partner's UID
    const participants = pairDoc.data().participants as [string, string];
    const partnerUid = participants.find((id) => id !== uid);

    if (!partnerUid) {

      return null;
    }

    // Get partner's profile
    const partnerDoc = await getDoc(doc(db, "users", partnerUid));
    if (!partnerDoc.exists()) {

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
      showOnboardingAfterUnpair: data.showOnboardingAfterUnpair, // ADD THIS LINE
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
          showOnboardingAfterUnpair: data.showOnboardingAfterUnpair, // ADD THIS LINE
        };

        callback(profile);
      } else {

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
                showOnboardingAfterUnpair: data.showOnboardingAfterUnpair, // ADD THIS LINE
              };

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

    profileUnsubscribe();
    if (partnerUnsubscribe) partnerUnsubscribe();
  };
}

/**
 * Delete account
 * Permanently deletes user data, avatar, and auth account
 */
export async function deleteAccount(): Promise<void> {
  const uid = getCurrentUserId();
  const user = auth.currentUser;

  if (!uid || !user) {
    throw new Error("No user authenticated");
  }



  try {
    // 1. Delete avatar from Cloudinary (if exists)
    // Note: We can't easily delete from Cloudinary without the public_id,
    // but we can rely on the folder structure 'notify/avatars/{uid}'
    // For now, we'll skip explicit Cloudinary deletion as it requires admin SDK or keeping track of public_id.
    // In a real app, you'd want a Cloud Function to handle this cleanup.

    // 2. Remove from pairing (if paired)
    const profile = await getProfile();
    if (profile?.pairId) {

      // We can use the existing unpair logic or just let the partner know
      // For simplicity, we'll just delete our reference.
      // Ideally, trigger an unpair action first.
      const pairRef = doc(db, "pairs", profile.pairId);
      const pairSnap = await getDoc(pairRef);

      if (pairSnap.exists()) {
        const data = pairSnap.data();
        const otherUserId = data.participants.find((id: string) => id !== uid);

        // Notify partner or just delete the pair doc if we want to be aggressive
        // Better: Update pair to remove this user, effectively unpairing
        await updateDoc(pairRef, {
          participants: data.participants.filter((id: string) => id !== uid),
          active: false,
          updatedAt: serverTimestamp(),
        });

        // Flag partner to show onboarding
        if (otherUserId) {
          await updateDoc(doc(db, "users", otherUserId), {
            pairId: null,
            showOnboardingAfterUnpair: true,
          });
        }
      }
    }

    // 3. Delete Firestore User Document

    await deleteDoc(doc(db, "users", uid));

    // 4. Delete Auth Account

    await deleteUser(user);


  } catch (error: any) {
    console.error("❌ Error deleting account:", error);
    if (error.code === "auth/requires-recent-login") {
      throw new Error("Please log out and log in again to delete your account.");
    }
    throw error;
  }
}
