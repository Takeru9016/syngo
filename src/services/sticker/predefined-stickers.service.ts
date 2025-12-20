import manifest from "../../../assets/stickers/predefined/manifest.json";
import { PredefinedStickerManifest, Sticker, PredefinedStickerCategory } from "@/types";

// Use require for the placeholder image since it's a local asset
const placeholderImage = require("../../../assets/stickers/predefined/placeholder.png");

class PredefinedStickersService {
    private manifest: PredefinedStickerManifest = manifest as PredefinedStickerManifest;
    private cachedStickers: Sticker[] | null = null;

    /**
     * Get all predefined stickers
     */
    getAll(): Sticker[] {
        if (this.cachedStickers) {
            return this.cachedStickers;
        }

        const stickers: Sticker[] = this.manifest.stickers.map((item) => {
            return {
                id: item.id,
                name: item.name,
                imageUrl: placeholderImage, // Using local require, React Native will handle it
                createdBy: "system",
                createdAt: 0,
                isPredefined: true,
                category: item.category,
                tags: item.tags,
            };
        });

        this.cachedStickers = stickers;
        return stickers;
    }

    /**
     * Get stickers by category
     */
    getByCategory(categoryId: string): Sticker[] {
        const all = this.getAll();
        return all.filter((s) => s.category === categoryId);
    }

    /**
     * Get all categories
     */
    getCategories(): PredefinedStickerCategory[] {
        return this.manifest.categories;
    }

    /**
     * Search stickers by name or tags
     */
    search(query: string): Sticker[] {
        const all = this.getAll();
        const lowerQuery = query.toLowerCase();

        return all.filter(
            (s) =>
                s.name.toLowerCase().includes(lowerQuery) ||
                s.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Clear cache (useful for testing or if manifest updates)
     */
    clearCache(): void {
        this.cachedStickers = null;
    }
}

export const predefinedStickersService = new PredefinedStickersService();
