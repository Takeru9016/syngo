import { useQuery } from "@tanstack/react-query";
import { predefinedStickersService } from "@/services/sticker/predefined-stickers.service";

/**
 * Hook to get all predefined stickers
 */
export function usePredefinedStickers() {
    return useQuery({
        queryKey: ["predefined-stickers"],
        queryFn: () => predefinedStickersService.getAll(),
        staleTime: Infinity, // Never refetch (local data)
        gcTime: Infinity, // Keep in cache forever
    });
}

/**
 * Hook to get predefined stickers by category
 */
export function usePredefinedStickersByCategory(categoryId: string) {
    return useQuery({
        queryKey: ["predefined-stickers", "category", categoryId],
        queryFn: () => predefinedStickersService.getByCategory(categoryId),
        staleTime: Infinity,
        gcTime: Infinity,
        enabled: !!categoryId, // Only run if categoryId is provided
    });
}

/**
 * Hook to get all predefined sticker categories
 */
export function usePredefinedStickerCategories() {
    return {
        data: predefinedStickersService.getCategories(),
        isLoading: false,
    };
}

/**
 * Hook to search predefined stickers
 */
export function useSearchPredefinedStickers(query: string) {
    return useQuery({
        queryKey: ["predefined-stickers", "search", query],
        queryFn: () => predefinedStickersService.search(query),
        staleTime: Infinity,
        gcTime: Infinity,
        enabled: query.length > 0, // Only search if query is not empty
    });
}
