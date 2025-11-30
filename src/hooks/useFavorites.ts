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
import { FavoriteService } from "@/services/favorites/favorites.service";
import { Favorite, FavoriteCategory } from "@/types";
import { useProfileStore } from "@/store/profile";

type CreatePayload = {
  title: string;
  category: FavoriteCategory;
  description: string;
  imageUrl?: string;
  url?: string;
};

type UpdatePayload = {
  id: string;
  updates: Partial<Omit<Favorite, "id" | "createdBy" | "createdAt">>;
};

const key = (pairId?: string) => ["favorites", pairId || "none"] as const;

export function useFavorites() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();

  // Set up real-time listener
  useEffect(() => {
    if (!pairId) {
      return;
    }

    const q = query(
      collection(db, "favorites"),
      where("pairId", "==", pairId),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const favorites: Favorite[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: String(data.title ?? ""),
            category: (data.category as FavoriteCategory) || "other",
            description: String(data.description ?? ""),
            imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
            url: data.url ? String(data.url) : undefined,
            createdBy: String(data.createdBy ?? ""),
            createdAt: Number(data.createdAt ?? 0),
          };
        });

        // Update React Query cache directly
        qc.setQueryData<Favorite[]>(key(pairId), favorites);
      },
      (error) => {
        console.error("❌ [useFavorites] Listener error:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pairId, qc]);

  return useQuery({
    queryKey: key(pairId),
    queryFn: () => {
      return FavoriteService.listByPair();
    },
    enabled: !!pairId,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useCreateFavorite() {
  return useMutation({
    mutationFn: (payload: CreatePayload) => {
      return FavoriteService.create(payload);
    },
    onSuccess: async (newId) => {},
    onError: (error) => {
      console.error("❌ [useCreateFavorite] Error:", error);
    },
  });
}

export function useUpdateFavorite() {
  return useMutation({
    mutationFn: ({ id, updates }: UpdatePayload) => {
      const { createdAt, createdBy, id: _ignore, ...safe } = updates as any;

      return FavoriteService.update(id, safe);
    },
    onError: (error) => {
      console.error("❌ [useUpdateFavorite] Error:", error);
    },
    onSuccess: (_, vars) => {},
  });
}

export function useDeleteFavorite() {
  return useMutation({
    mutationFn: (id: string) => {
      return FavoriteService.remove(id);
    },
    onError: (error) => {
      console.error("❌ [useDeleteFavorite] Error:", error);
    },
    onSuccess: (_, id) => {},
  });
}
