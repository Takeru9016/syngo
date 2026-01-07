import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "@/services/auth/auth.service";
import { Sticker } from "@/types";
import { useProfileStore } from "@/store/profile";
import { notifyPartner } from "@/services/notification/notifyPartner";

type CreateStickerInput = {
  name: string;
  imageUrl: string;
  description?: string;
};

type UpdateStickerInput = {
  name?: string;
  description?: string;
  isFavorite?: boolean;
};

function nowMs(): number {
  return Date.now();
}

function requirePairId(): string {
  const profile = useProfileStore.getState().profile;

  const pairId = profile?.pairId;
  if (!pairId) {
    console.error("❌ [StickerService] No pairId found in profile");
    throw new Error("Pair not established");
  }

  return pairId;
}

export const StickerService = {
  async listByPair(): Promise<Sticker[]> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();

    const q = query(
      collection(db, "stickers"),
      where("pairId", "==", pairId),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const snap = await getDocs(q);

    const stickers = snap.docs.map((d) => {
      const data = d.data() as any;

      const sticker: Sticker = {
        id: d.id,
        name: String(data.name ?? ""),
        description: String(data.description ?? ""),
        imageUrl: String(data.imageUrl ?? ""),
        createdBy: String(data.createdBy ?? ""),
        createdAt: Number(data.createdAt ?? 0),
        isFavorite: Boolean(data.isFavorite),
      };
      return sticker;
    });

    return stickers;
  },

  async create(input: CreateStickerInput): Promise<string> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("❌ [StickerService.create] Not authenticated");
      throw new Error("Not authenticated");
    }

    const pairId = useProfileStore.getState().profile?.pairId;
    if (!pairId) {
      console.error("❌ [StickerService.create] No pairId found");
      throw new Error("Not paired");
    }

    const payload = {
      name: input.name,
      imageUrl: input.imageUrl,
      description: input.description || "",
      isFavorite: false,
      createdBy: uid,
      pairId,
      createdAt: nowMs(),
      updatedAt: serverTimestamp(),
    };

    try {
      const ref = await addDoc(collection(db, "stickers"), payload);

      // Send notification to partner
      await notifyPartner({
        type: "sticker_sent",
        title: "🎨 New Sticker",
        body: `${input.name}`,
        data: { stickerId: ref.id, imageUrl: input.imageUrl },
      });

      return ref.id;
    } catch (error) {
      console.error("❌ [StickerService.create] Error:", error);
      throw error;
    }
  },

  async update(id: string, updates: UpdateStickerInput): Promise<void> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();

    const ref = doc(db, "stickers", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.error("❌ [StickerService.update] Sticker not found:", id);
        throw new Error("Sticker not found");
      }

      const data = snap.data() as any;

      if (data.pairId !== pairId) {
        console.error(
          "❌ [StickerService.update] PairId mismatch. Doc pairId:",
          data.pairId,
          "Current pairId:",
          pairId
        );
        throw new Error("Forbidden: not in this pair");
      }

      const patch: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.name !== undefined) patch.name = updates.name;
      if (updates.description !== undefined)
        patch.description = updates.description;
      if (updates.isFavorite !== undefined)
        patch.isFavorite = updates.isFavorite;

      await updateDoc(ref, patch);
    } catch (error) {
      console.error(
        "❌ [StickerService.update] Error updating sticker:",
        error
      );
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();

    const ref = doc(db, "stickers", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.warn("⚠️ [StickerService.remove] Sticker not found:", id);
        return;
      }

      const data = snap.data() as any;

      if (data.pairId !== pairId) {
        console.error(
          "❌ [StickerService.remove] PairId mismatch. Doc pairId:",
          data.pairId,
          "Current pairId:",
          pairId
        );
        throw new Error("Forbidden: not in this pair");
      }

      await deleteDoc(ref);
    } catch (error) {
      console.error(
        "❌ [StickerService.remove] Error deleting sticker:",
        error
      );
      throw error;
    }
  },
};
