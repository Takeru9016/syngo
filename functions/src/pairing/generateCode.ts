import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Generate a random pairing code (6-8 characters)
 */
function generateRandomCode(length: number = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Callable function: Generate pairing code
 */
export const generatePairingCode = onCall(async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const uid = request.auth.uid;

  try {
    // Check if user is already paired
    const userDoc = await db.doc(`users/${uid}`).get();
    const userData = userDoc.data();

    if (userData?.pairId) {
      throw new HttpsError("failed-precondition", "User is already paired");
    }

    // Rate limiting: Check how many codes generated in last hour
    const oneHourAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 60 * 60 * 1000)
    );

    const recentCodes = await db
      .collection("pairCodes")
      .where("ownerUid", "==", uid)
      .where("createdAt", ">", oneHourAgo)
      .get();

    if (recentCodes.size >= 5) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many codes generated. Please wait."
      );
    }

    // Generate unique code
    let code = "";
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      code = generateRandomCode(6);
      const existingCode = await db.doc(`pairCodes/${code}`).get();
      if (!existingCode.exists) {
        break;
      }
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new HttpsError("internal", "Failed to generate unique code");
    }

    // Store code with 10-minute expiry
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 10 * 60 * 1000)
    );

    await db.doc(`pairCodes/${code}`).set({
      code,
      ownerUid: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt,
      used: false,
    });

    console.log(`✅ Generated pairing code: ${code} for user: ${uid}`);

    return {
      code,
      expiresAt: expiresAt.toMillis(),
    };
  } catch (error: any) {
    console.error("❌ Error generating pairing code:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Callable function: Redeem pairing code
 */
export const redeemPairingCode = onCall(async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const { code } = request.data;
  const redeemerUid = request.auth.uid;

  if (!code || typeof code !== "string") {
    throw new HttpsError("invalid-argument", "Code is required");
  }

  try {
    // Run transaction to prevent race conditions
    const result = await db.runTransaction(async (transaction) => {
      // Get code document
      const codeRef = db.doc(`pairCodes/${code.toUpperCase()}`);
      const codeDoc = await transaction.get(codeRef);

      if (!codeDoc.exists) {
        throw new HttpsError("not-found", "Invalid pairing code");
      }

      const codeData = codeDoc.data()!;

      // Check if code is expired
      const now = admin.firestore.Timestamp.now();
      if (codeData.expiresAt.toMillis() < now.toMillis()) {
        throw new HttpsError("failed-precondition", "Code has expired");
      }

      // Check if code is already used
      if (codeData.used) {
        throw new HttpsError("failed-precondition", "Code already used");
      }

      const ownerUid = codeData.ownerUid;

      // Check if trying to pair with self
      if (ownerUid === redeemerUid) {
        throw new HttpsError(
          "failed-precondition",
          "Cannot pair with yourself"
        );
      }

      // Get both users
      const ownerRef = db.doc(`users/${ownerUid}`);
      const redeemerRef = db.doc(`users/${redeemerUid}`);

      const ownerDoc = await transaction.get(ownerRef);
      const redeemerDoc = await transaction.get(redeemerRef);

      if (!ownerDoc.exists || !redeemerDoc.exists) {
        throw new HttpsError("not-found", "User not found");
      }

      const ownerData = ownerDoc.data()!;
      const redeemerData = redeemerDoc.data()!;

      // Check if either user is already paired
      if (ownerData.pairId || redeemerData.pairId) {
        throw new HttpsError(
          "failed-precondition",
          "One or both users are already paired"
        );
      }

      // Create pair document
      const pairRef = db.collection("pairs").doc();
      const pairId = pairRef.id;

      transaction.set(pairRef, {
        participants: [ownerUid, redeemerUid],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "active",
      });

      // Update both users with pairId
      transaction.update(ownerRef, { pairId });
      transaction.update(redeemerRef, { pairId });

      // Mark code as used
      transaction.update(codeRef, { used: true });

      return {
        pairId,
        ownerUid,
        redeemerUid,
        ownerName: ownerData.displayName,
        redeemerName: redeemerData.displayName,
      };
    });

    console.log(
      `✅ Pairing successful: ${result.ownerUid} <-> ${result.redeemerUid}`
    );

    // Send push notifications to both devices (non-blocking)
    sendPairingSuccessNotifications(
      result.ownerUid,
      result.redeemerUid,
      result.ownerName,
      result.redeemerName,
      result.pairId
    ).catch((error) =>
      console.error("Failed to send pairing notifications:", error)
    );

    return {
      success: true,
      pairId: result.pairId,
      partnerName: result.ownerName,
    };
  } catch (error: any) {
    console.error("❌ Error redeeming pairing code:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Helper: Send pairing success notifications
 */
async function sendPairingSuccessNotifications(
  ownerUid: string,
  redeemerUid: string,
  ownerName: string,
  redeemerName: string,
  pairId: string
) {
  const { sendPushToUser } = await import("../notifications/sendPush");
  const { createInAppNotification } = await import("../notifications/sendPush");

  // Send to owner
  await Promise.all([
    sendPushToUser(ownerUid, {
      title: "Pairing Successful! 💕",
      body: `You're now connected with ${redeemerName}`,
      data: { type: "pair_success", pairId },
    }),
    createInAppNotification(ownerUid, pairId, {
      type: "pair_success",
      title: "Pairing Successful! 💕",
      body: `You're now connected with ${redeemerName}`,
    }),
  ]);

  // Send to redeemer
  await Promise.all([
    sendPushToUser(redeemerUid, {
      title: "Pairing Successful! 💕",
      body: `You're now connected with ${ownerName}`,
      data: { type: "pair_success", pairId },
    }),
    createInAppNotification(redeemerUid, pairId, {
      type: "pair_success",
      title: "Pairing Successful! 💕",
      body: `You're now connected with ${ownerName}`,
    }),
  ]);
}
