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
import { Favorite, FavoriteCategory } from "@/types";
import { useProfileStore } from "@/store/profile";
import { notifyPartner } from "@/services/notification/notifyPartner";

type CreateFavoriteInput = {
  title: string;
  category: FavoriteCategory;
  description: string;
  imageUrl?: string;
  url?: string;
};

type UpdateFavoriteInput = Partial<
  Omit<Favorite, "id" | "createdBy" | "createdAt">
>;

function nowMs(): number {
  return Date.now();
}

function requirePairId(): string {
  const profile = useProfileStore.getState().profile;


  const pairId = profile?.pairId;
  if (!pairId) {
    console.error("❌ [FavoriteService] No pairId found in profile");
    throw new Error("Pair not established");
  }


  return pairId;
}

export const FavoriteService = {
  async listByPair(): Promise<Favorite[]> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();



    const q = query(
      collection(db, "favorites"),
      where("pairId", "==", pairId),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const snap = await getDocs(q);


    const favorites = snap.docs.map((d) => {
      const data = d.data() as any;


      const favorite: Favorite = {
        id: d.id,
        title: String(data.title ?? ""),
        category: (data.category as FavoriteCategory) || "other",
        description: String(data.description ?? ""),
        imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
        url: data.url ? String(data.url) : undefined,
        createdBy: String(data.createdBy ?? ""),
        createdAt: Number(data.createdAt ?? 0),
      };
      return favorite;
    });

    return favorites;
  },
  async create(input: CreateFavoriteInput): Promise<string> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("❌ [FavoriteService.create] Not authenticated");
      throw new Error("Not authenticated");
    }

    const pairId = useProfileStore.getState().profile?.pairId;
    if (!pairId) {
      console.error("❌ [FavoriteService.create] No pairId found");
      throw new Error("Not paired");
    }

    const payload = {
      title: input.title,
      category: input.category,
      description: input.description || "",
      imageUrl: input.imageUrl || null,
      url: input.url || null,
      createdBy: uid,
      pairId,
      createdAt: nowMs(),
      updatedAt: serverTimestamp(),
    };



    try {
      const ref = await addDoc(collection(db, "favorites"), payload);


      // Send notification to partner
      await notifyPartner({
        type: "favorite_added",
        title: "⭐ New Favorite",
        body: `${input.title}`,
        data: { favoriteId: ref.id, category: input.category },
      });

      return ref.id;
    } catch (error) {
      console.error("❌ [FavoriteService.create] Error:", error);
      throw error;
    }
  },

  async update(id: string, updates: UpdateFavoriteInput): Promise<void> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();



    const ref = doc(db, "favorites", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.error("❌ [FavoriteService.update] Favorite not found:", id);
        throw new Error("Favorite not found");
      }

      const data = snap.data() as any;


      if (data.pairId !== pairId) {
        console.error(
          "❌ [FavoriteService.update] PairId mismatch. Doc pairId:",
          data.pairId,
          "Current pairId:",
          pairId
        );
        throw new Error("Forbidden: not in this pair");
      }

      const patch: Record<string, any> = { updatedAt: serverTimestamp() };
      if (updates.title !== undefined) patch.title = updates.title;
      if (updates.category !== undefined) patch.category = updates.category;
      if (updates.description !== undefined)
        patch.description = updates.description;
      if (updates.imageUrl !== undefined)
        patch.imageUrl = updates.imageUrl || null;
      if (updates.url !== undefined) patch.url = updates.url || null;



      await updateDoc(ref, patch);

    } catch (error) {
      console.error(
        "❌ [FavoriteService.update] Error updating favorite:",
        error
      );
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();



    const ref = doc(db, "favorites", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.warn("⚠️ [FavoriteService.remove] Favorite not found:", id);
        return;
      }

      const data = snap.data() as any;


      if (data.pairId !== pairId) {
        console.error(
          "❌ [FavoriteService.remove] PairId mismatch. Doc pairId:",
          data.pairId,
          "Current pairId:",
          pairId
        );
        throw new Error("Forbidden: not in this pair");
      }

      await deleteDoc(ref);

    } catch (error) {
      console.error(
        "❌ [FavoriteService.remove] Error deleting favorite:",
        error
      );
      throw error;
    }
  },
};
