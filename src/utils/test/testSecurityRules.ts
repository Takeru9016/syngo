import { getDoc } from "firebase/firestore";

import { getCurrentUserId } from "@/services/auth/auth.service";
import { userDoc } from "../firestore-helpers";

export async function testSecurityRules() {
  console.log("🔒 Testing Firestore Security Rules...");

  const uid = getCurrentUserId();
  if (!uid) {
    console.error("❌ No user authenticated");
    return;
  }

  try {
    // Test 1: Read own profile (should succeed)
    console.log("Test 1: Reading own profile...");
    const profileSnap = await getDoc(userDoc(uid));
    if (profileSnap.exists()) {
      console.log("✅ Can read own profile");
    } else {
      console.log("⚠️ Profile does not exist yet");
    }

    // Test 2: Try to read another user's profile (should fail)
    console.log("Test 2: Trying to read another user profile...");
    try {
      await getDoc(userDoc("fake-uid-12345"));
      console.log("❌ SECURITY ISSUE: Can read other user profiles!");
    } catch (error: any) {
      if (error.code === "permission-denied") {
        console.log("✅ Cannot read other user profiles (correct)");
      } else {
        console.log("⚠️ Unexpected error:", error.message);
      }
    }

    console.log("🔒 Security rules test complete!");
  } catch (error: any) {
    console.error("❌ Security rules test failed:", error.message);
  }
}
