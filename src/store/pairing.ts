import { create } from "zustand";

import * as pairingService from "@/services/pairing/pairing.service";
import { formatCode } from "@/utils/code-generator";

export type PairingState = {
  // State
  isPaired: boolean;
  pairId: string | null;
  partnerUid: string | null;
  pairCreatedAt: number | null; // NEW: Timestamp when pair was created
  code: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  generateCode: () => Promise<void>;
  redeemCode: (code: string) => Promise<void>;
  checkExistingCode: () => Promise<boolean>;
  initializePair: () => Promise<void>; // NEW: Fetch pair data including createdAt
  unpair: () => Promise<void>;
  setPairId: (pairId: string | null) => void;
  reset: () => void;
  clearError: () => void;
};

export const usePairingStore = create<PairingState>((set, get) => ({
  // Initial state
  isPaired: false,
  pairId: null,
  partnerUid: null,
  pairCreatedAt: null,
  code: null,
  expiresAt: null,
  isLoading: false,
  error: null,

  // Generate a new pair code
  generateCode: async () => {
    try {
      set({ isLoading: true, error: null });

      const result = await pairingService.generatePairCode();

      set({
        code: formatCode(result.code),
        expiresAt: result.expiresAt,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("❌ Error generating code:", error.message);

      let errorMessage = "Failed to generate code. Please try again.";
      if (error.message === "already_paired") {
        errorMessage = "You're already paired!";
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  // Redeem a partner's code
  redeemCode: async (code: string) => {
    try {
      set({ isLoading: true, error: null });

      const result = await pairingService.redeemPairCode(code);

      set({
        isPaired: true,
        pairId: result.pairId,
        partnerUid: result.partnerUid,
        isLoading: false,
        code: null,
        expiresAt: null,
      });
    } catch (error: any) {
      console.error("❌ Error redeeming code:", error.message);

      let errorMessage = "Failed to pair. Please try again.";

      switch (error.message) {
        case "not_found":
          errorMessage = "Invalid code. Please check and try again.";
          break;
        case "expired":
          errorMessage =
            "This code has expired. Ask your partner for a new one.";
          break;
        case "already_used":
          errorMessage = "This code has already been used.";
          break;
        case "own_code":
          errorMessage = "You can't pair with yourself!";
          break;
        case "already_paired":
          errorMessage =
            "You're already paired. Unpair first to pair with someone new.";
          break;
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  // Check if user has an existing active code
  checkExistingCode: async () => {
    try {
      const activeCode = await pairingService.getActiveCode();

      if (activeCode) {
        set({
          code: formatCode(activeCode.code),
          expiresAt: activeCode.expiresAt,
        });
        return true;
      } else {
        set({
          code: null,
          expiresAt: null,
        });
        return false;
      }
    } catch (error: any) {
      console.error("❌ Error checking existing code:", error.message);
      return false;
    }
  },

  // Initialize pair data (fetch createdAt timestamp)
  initializePair: async () => {
    const { pairId } = get();
    if (!pairId) return;

    try {
      const pairData = await pairingService.getCurrentPair();
      if (pairData) {
        const { getAuth } = await import("firebase/auth");
        const currentUid = getAuth().currentUser?.uid;
        set({
          pairCreatedAt: pairData.createdAt,
          partnerUid:
            pairData.users?.find((u) => u.uid !== currentUid)?.uid || null,
        });
      }
    } catch (error: any) {
      console.error("❌ Error initializing pair:", error.message);
    }
  },

  // Unpair from current partner
  unpair: async () => {
    try {
      set({ isLoading: true, error: null });

      await pairingService.unpair();

      set({
        isPaired: false,
        pairId: null,
        partnerUid: null,
        code: null,
        expiresAt: null,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("❌ Error unpairing:", error.message);

      set({
        error: "Failed to unpair. Please try again.",
        isLoading: false,
      });
    }
  },

  // Set pair ID (called by profile listener)
  setPairId: (pairId: string | null) => {
    set({
      isPaired: !!pairId,
      pairId,
    });
  },

  // Reset pairing state
  reset: () => {
    set({
      isPaired: false,
      pairId: null,
      partnerUid: null,
      pairCreatedAt: null,
      code: null,
      expiresAt: null,
      isLoading: false,
      error: null,
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
