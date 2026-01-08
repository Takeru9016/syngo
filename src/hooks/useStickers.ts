import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { StickerService } from "@/services/sticker/sticker.service";
import { Sticker } from "@/types";
import { useProfileStore } from "@/store/profile";

type CreatePayload = {
  name: string;
  imageUrl: string;
  description?: string;
};

type UpdatePayload = {
  id: string;
  name?: string;
  description?: string;
  imageUrl?: string;
};

const key = (pairId?: string) => ["stickers", pairId || "none"] as const;

export function useStickers() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();

  // Set up real-time listener
  useEffect(() => {
    if (!pairId) {
      return;
    }

    const q = query(
      collection(db, "stickers"),
      where("pairId", "==", pairId),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const stickers: Sticker[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: String(data.name ?? ""),
            description: String(data.description ?? ""),
            imageUrl: String(data.imageUrl ?? ""),
            createdBy: String(data.createdBy ?? ""),
            createdAt: Number(data.createdAt ?? 0),
          };
        });

        // Update React Query cache directly
        qc.setQueryData<Sticker[]>(key(pairId), stickers);
      },
      (error) => {
        console.error("❌ [useStickers] Listener error:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pairId, qc]);

  return useQuery({
    queryKey: key(pairId),
    queryFn: () => {
      return StickerService.listByPair();
    },
    enabled: !!pairId,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useCreateSticker() {
  return useMutation({
    mutationFn: (payload: CreatePayload) => {
      return StickerService.create(payload);
    },
    onSuccess: async (newId) => {},
    onError: (error) => {
      console.error("❌ [useCreateSticker] Error:", error);
    },
  });
}

export function useUpdateSticker() {
  return useMutation({
    mutationFn: ({ id, ...updates }: UpdatePayload) => {
      return StickerService.update(id, updates);
    },
    onError: (error) => {
      console.error("❌ [useUpdateSticker] Error:", error);
    },
    onSuccess: (_, vars) => {},
  });
}

export function useDeleteSticker() {
  return useMutation({
    mutationFn: (id: string) => {
      return StickerService.remove(id);
    },
    onError: (error) => {
      console.error("❌ [useDeleteSticker] Error:", error);
    },
    onSuccess: (_, id) => {},
  });
}
