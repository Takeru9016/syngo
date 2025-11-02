import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { z } from "zod";

const db = admin.firestore();

// Validation schemas
const GenerateCodeSchema = z.object({
  uid: z.string().min(1),
});

const RedeemCodeSchema = z.object({
  code: z.string().length(8),
  uid: z.string().min(1),
});

/**
 * Generate a secure 8-character pairing code
 */
function generatePairCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Callable function: Generate pairing code
 * Rate limited: 1 code per 10 minutes per user
 */
export const generatePairingCode = onCall(async (request) => {
  console.log("🔐 [generatePairingCode] Called by:", request.auth?.uid);

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be authenticated");
  }

  const parsed = GenerateCodeSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid input");
  }

  const { uid } = parsed.data;

  if (uid !== request.auth.uid) {
    throw new HttpsError("permission-denied", "UID mismatch");
  }

  try {
    // Check rate limit: no active codes in last 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const existingCodes = await db
      .collection("pairCodes")
      .where("ownerUid", "==", uid)
      .where("used", "==", false)
      .where("expiresAt", ">", tenMinutesAgo)
      .limit(1)
      .get();

    if (!existingCodes.empty) {
      const existingCode = existingCodes.docs[0].data();
      console.log(
        "⚠️ [generatePairingCode] Active code exists:",
        existingCode.code
      );
      return {
        code: existingCode.code,
        expiresAt: existingCode.expiresAt,
      };
    }

    // Generate new code
    const code = generatePairCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await db.collection("pairCodes").doc(code).set({
      code,
      ownerUid: uid,
      used: false,
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ [generatePairingCode] Created code:", code);

    return { code, expiresAt };
  } catch (error) {
    console.error("❌ [generatePairingCode] Error:", error);
    throw new HttpsError("internal", "Failed to generate code");
  }
});

/**
 * Callable function: Redeem pairing code
 * Atomic transaction to prevent race conditions
 */
export const redeemPairingCode = onCall(async (request) => {
  console.log("🔓 [redeemPairingCode] Called by:", request.auth?.uid);

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be authenticated");
  }

  const parsed = RedeemCodeSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Invalid input");
  }

  const { code, uid } = parsed.data;

  if (uid !== request.auth.uid) {
    throw new HttpsError("permission-denied", "UID mismatch");
  }

  try {
    // Run transaction
    const result = await db.runTransaction(async (transaction) => {
      // 1. Get code document
      const codeRef = db.collection("pairCodes").doc(code);
      const codeDoc = await transaction.get(codeRef);

      if (!codeDoc.exists) {
        throw new HttpsError("not-found", "Invalid code");
      }

      const codeData = codeDoc.data()!;

      // 2. Validate code
      if (codeData.used) {
        throw new HttpsError("failed-precondition", "Code already used");
      }

      if (codeData.expiresAt < Date.now()) {
        throw new HttpsError("failed-precondition", "Code expired");
      }

      if (codeData.ownerUid === uid) {
        throw new HttpsError(
          "failed-precondition",
          "Cannot pair with yourself"
        );
      }

      const ownerUid = codeData.ownerUid;

      // 3. Check if either user is already paired
      const [ownerDoc, redeemerDoc] = await Promise.all([
        transaction.get(db.collection("users").doc(ownerUid)),
        transaction.get(db.collection("users").doc(uid)),
      ]);

      if (ownerDoc.exists && ownerDoc.data()?.pairId) {
        throw new HttpsError(
          "failed-precondition",
          "Code owner already paired"
        );
      }

      if (redeemerDoc.exists && redeemerDoc.data()?.pairId) {
        throw new HttpsError("failed-precondition", "You are already paired");
      }

      // 4. Create pair document
      const pairRef = db.collection("pairs").doc();
      const pairId = pairRef.id;

      transaction.set(pairRef, {
        participants: [ownerUid, uid],
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 5. Update both user profiles
      transaction.update(db.collection("users").doc(ownerUid), {
        pairId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(db.collection("users").doc(uid), {
        pairId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 6. Mark code as used
      transaction.update(codeRef, {
        used: true,
        usedBy: uid,
        usedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ [redeemPairingCode] Pair created:", pairId);

      return { pairId, ownerUid, redeemerUid: uid };
    });

    // 7. Send notifications to both users (outside transaction)
    await Promise.all([
      db.collection("notifications").add({
        recipientUid: result.ownerUid,
        type: "pair_accepted",
        title: "🎉 Pairing Successful",
        body: "You are now connected!",
        read: false,
        createdAt: Date.now(),
        data: { pairId: result.pairId },
      }),
      db.collection("notifications").add({
        recipientUid: result.redeemerUid,
        type: "pair_accepted",
        title: "🎉 Pairing Successful",
        body: "You are now connected!",
        read: false,
        createdAt: Date.now(),
        data: { pairId: result.pairId },
      }),
    ]);

    return { success: true, pairId: result.pairId };
  } catch (error: any) {
    console.error("❌ [redeemPairingCode] Error:", error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError("internal", "Failed to redeem code");
  }
});
