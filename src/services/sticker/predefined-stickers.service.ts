import manifest from "../../../assets/stickers/predefined/manifest.json";
import {
    PredefinedStickerManifest,
    Sticker,
    PredefinedStickerCategory,
} from "@/types";

// Static requires for all sticker images (React Native requires static paths)
const stickerImages: Record<string, any> = {
    "hearts.png": require("../../../assets/stickers/predefined/hearts.png"),
    "kisses.png": require("../../../assets/stickers/predefined/kisses.png"),
    "hugs.png": require("../../../assets/stickers/predefined/hugs.png"),
    "thinking-of-you.png": require("../../../assets/stickers/predefined/thinking-of-you.png"),
    "good-morning.png": require("../../../assets/stickers/predefined/good-morning.png"),
    "good-night.png": require("../../../assets/stickers/predefined/good-night.png"),
    "missing-you.png": require("../../../assets/stickers/predefined/missing-you.png"),
    "love-you.png": require("../../../assets/stickers/predefined/love-you.png"),
    "happy.png": require("../../../assets/stickers/predefined/happy.png"),
    "excited.png": require("../../../assets/stickers/predefined/excited.png"),
    "laughing.png": require("../../../assets/stickers/predefined/laughing.png"),
    "sad.png": require("../../../assets/stickers/predefined/sad.png"),
    "congratulations.png": require("../../../assets/stickers/predefined/congratulations.png"),
    "happy-birthday.png": require("../../../assets/stickers/predefined/happy-birthday.png"),
    "thank-you.png": require("../../../assets/stickers/predefined/thank-you.png"),
    "sorry.png": require("../../../assets/stickers/predefined/sorry.png"),
    "here-for-you.png": require("../../../assets/stickers/predefined/here-for-you.png"),
    "proud.png": require("../../../assets/stickers/predefined/proud.png"),
    "cutie.png": require("../../../assets/stickers/predefined/cutie.png"),
    "amazing.png": require("../../../assets/stickers/predefined/amazing.png"),
};

// Fallback placeholder image
const placeholderImage = require("../../../assets/stickers/predefined/placeholder.png");

class PredefinedStickersService {
    private manifest: PredefinedStickerManifest =
        manifest as PredefinedStickerManifest;
    private cachedStickers: Sticker[] | null = null;

    /**
     * Get all predefined stickers
     */
    getAll(): Sticker[] {
        if (this.cachedStickers) {
            return this.cachedStickers;
        }

        const stickers: Sticker[] = this.manifest.stickers.map((item) => {
            // Get the image from our static requires map, fallback to placeholder
            const imageSource = stickerImages[item.filename] || placeholderImage;

            return {
                id: item.id,
                name: item.name,
                imageUrl: imageSource,
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
