# Pre-defined Stickers Feature Guide for Syngo

## 📋 Overview

This guide explains how to implement a **pre-defined sticker pack** feature for Syngo, allowing users to access a curated collection of ready-to-use stickers without needing to upload their own images.

---

## 🎯 Feature Concept

### What Are Pre-defined Stickers?

Pre-defined stickers are a collection of curated, ready-to-use images that:

- Come bundled with the app or loaded from a remote source
- Don't require users to upload custom images
- Can be instantly sent to partners
- Complement the existing custom sticker feature

### User Experience Flow

1. **Access**: User opens the Stickers screen
2. **Browse**: User sees tabs for "Custom" and "Pre-defined" stickers
3. **Select**: User taps a pre-defined sticker
4. **Send**: Sticker is immediately sent to their partner (or added to their collection)

---

## 🏗️ Current Architecture

### Existing Sticker System

Your current implementation includes:

#### **Data Model** ([types/index.ts](file:///Users/sahiljadhav/Projects/syngo/src/types/index.ts#L33-L39))

```typescript
export type Sticker = {
  id: string;
  name: string;
  imageUrl: string;
  createdBy: string;
  createdAt: number;
};
```

#### **Key Components**

- **[stickers.tsx](<file:///Users/sahiljadhav/Projects/syngo/app/(tabs)/stickers.tsx>)**: Main stickers screen with gallery view
- **[AddStickerModal.tsx](file:///Users/sahiljadhav/Projects/syngo/src/components/Sticker/AddStickerModal.tsx)**: Modal for creating custom stickers
- **[StickerCard.tsx](file:///Users/sahiljadhav/Projects/syngo/src/components/Sticker/StickerCard.tsx)**: Individual sticker display component

#### **Services**

- **[sticker.service.ts](file:///Users/sahiljadhav/Projects/syngo/src/services/sticker/sticker.service.ts)**: CRUD operations for stickers
- **[useStickers.ts](file:///Users/sahiljadhav/Projects/syngo/src/hooks/useStickers.ts)**: React Query hook for sticker data

#### **Storage**

- Custom stickers are stored in Firestore under `stickers` collection
- Images are uploaded to Cloudinary
- Each sticker is associated with a `pairId`

---

## 💡 Implementation Approaches

### Approach 1: Local Asset Bundle (Recommended for MVP)

**Pros:**

- ✅ No network dependency
- ✅ Fast loading
- ✅ No additional storage costs
- ✅ Simple implementation

**Cons:**

- ❌ Increases app bundle size
- ❌ Requires app update to add new stickers
- ❌ Limited to ~20-50 stickers

**Best for:** Initial release with a curated set of 20-30 stickers

---

### Approach 2: Remote JSON Configuration

**Pros:**

- ✅ Update stickers without app release
- ✅ Smaller app bundle
- ✅ Can add unlimited stickers
- ✅ A/B testing capabilities

**Cons:**

- ❌ Requires network connection
- ❌ Need CDN for images
- ❌ Caching complexity

**Best for:** Long-term scalability

---

### Approach 3: Hybrid Approach (Best of Both Worlds)

**Pros:**

- ✅ Core stickers bundled locally
- ✅ Additional stickers loaded remotely
- ✅ Graceful degradation
- ✅ Flexible updates

**Cons:**

- ❌ More complex implementation
- ❌ Need to manage two sources

**Best for:** Production-ready feature with growth potential

---

## 🛠️ Detailed Implementation Plan

### Phase 1: Local Asset Bundle (Quick Win)

#### Step 1: Create Sticker Assets

```bash
# Create directory structure
mkdir -p assets/stickers/predefined
```

Add 20-30 sticker images (PNG with transparency):

- `heart.png`
- `kiss.png`
- `hug.png`
- `thinking_of_you.png`
- `good_morning.png`
- `good_night.png`
- `miss_you.png`
- `love_you.png`
- etc.

**Image Specifications:**

- Format: PNG with transparency
- Size: 512x512px (or 1024x1024px for high quality)
- File size: < 100KB each (optimize with tools like TinyPNG)

---

#### Step 2: Create Sticker Manifest

Create `assets/stickers/predefined/manifest.json`:

```json
{
  "version": "1.0.0",
  "stickers": [
    {
      "id": "predefined_heart",
      "name": "Heart",
      "category": "love",
      "tags": ["love", "romance", "heart"],
      "filename": "heart.png"
    },
    {
      "id": "predefined_kiss",
      "name": "Kiss",
      "category": "love",
      "tags": ["kiss", "love", "romance"],
      "filename": "kiss.png"
    },
    {
      "id": "predefined_hug",
      "name": "Hug",
      "category": "affection",
      "tags": ["hug", "comfort", "support"],
      "filename": "hug.png"
    },
    {
      "id": "predefined_thinking",
      "name": "Thinking of You",
      "category": "thinking",
      "tags": ["thinking", "miss", "remember"],
      "filename": "thinking_of_you.png"
    },
    {
      "id": "predefined_good_morning",
      "name": "Good Morning",
      "category": "greetings",
      "tags": ["morning", "greeting", "hello"],
      "filename": "good_morning.png"
    }
  ],
  "categories": [
    { "id": "love", "name": "Love & Romance", "icon": "❤️" },
    { "id": "affection", "name": "Affection", "icon": "🤗" },
    { "id": "thinking", "name": "Thinking of You", "icon": "💭" },
    { "id": "greetings", "name": "Greetings", "icon": "👋" },
    { "id": "emotions", "name": "Emotions", "icon": "😊" }
  ]
}
```

---

#### Step 3: Update Type Definitions

Update `src/types/index.ts`:

```typescript
export type Sticker = {
  id: string;
  name: string;
  imageUrl: string;
  createdBy: string;
  createdAt: number;
  isPredefined?: boolean; // NEW: Flag for pre-defined stickers
  category?: string; // NEW: Category for organization
  tags?: string[]; // NEW: Tags for search/filtering
};

export type PredefinedStickerCategory = {
  id: string;
  name: string;
  icon: string;
};

export type PredefinedStickerManifest = {
  version: string;
  stickers: Array<{
    id: string;
    name: string;
    category: string;
    tags: string[];
    filename: string;
  }>;
  categories: PredefinedStickerCategory[];
};
```

---

#### Step 4: Create Predefined Stickers Service

Create `src/services/sticker/predefined-stickers.service.ts`:

```typescript
import { Asset } from "expo-asset";
import manifest from "@/assets/stickers/predefined/manifest.json";
import { PredefinedStickerManifest, Sticker } from "@/types";

class PredefinedStickersService {
  private manifest: PredefinedStickerManifest = manifest;
  private cachedStickers: Sticker[] | null = null;

  /**
   * Get all predefined stickers
   */
  async getAll(): Promise<Sticker[]> {
    if (this.cachedStickers) {
      return this.cachedStickers;
    }

    const stickers: Sticker[] = this.manifest.stickers.map((item) => {
      // Load local asset
      const imageAsset = Asset.fromModule(
        require(`@/assets/stickers/predefined/${item.filename}`)
      );

      return {
        id: item.id,
        name: item.name,
        imageUrl: imageAsset.uri || "",
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
  async getByCategory(categoryId: string): Promise<Sticker[]> {
    const all = await this.getAll();
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
  async search(query: string): Promise<Sticker[]> {
    const all = await this.getAll();
    const lowerQuery = query.toLowerCase();

    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

export const predefinedStickersService = new PredefinedStickersService();
```

---

#### Step 5: Create Hook for Predefined Stickers

Create `src/hooks/usePredefinedStickers.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { predefinedStickersService } from "@/services/sticker/predefined-stickers.service";

export function usePredefinedStickers() {
  return useQuery({
    queryKey: ["predefined-stickers"],
    queryFn: () => predefinedStickersService.getAll(),
    staleTime: Infinity, // Never refetch (local data)
    cacheTime: Infinity,
  });
}

export function usePredefinedStickersByCategory(categoryId: string) {
  return useQuery({
    queryKey: ["predefined-stickers", "category", categoryId],
    queryFn: () => predefinedStickersService.getByCategory(categoryId),
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}

export function usePredefinedStickerCategories() {
  return {
    data: predefinedStickersService.getCategories(),
    isLoading: false,
  };
}
```

---

#### Step 6: Update Stickers Screen UI

Modify `app/(tabs)/stickers.tsx` to include tabs:

```typescript
import { useState, useMemo } from "react";
import { Tabs, TabsContentProps } from "tamagui";
import { usePredefinedStickers } from "@/hooks/usePredefinedStickers";

export default function StickersScreen() {
  const [activeTab, setActiveTab] = useState<"custom" | "predefined">("custom");

  // Existing hooks
  const {
    data: customStickers = [],
    isLoading: customLoading,
    refetch,
  } = useStickers();

  // New hook for predefined stickers
  const { data: predefinedStickers = [], isLoading: predefinedLoading } =
    usePredefinedStickers();

  // ... rest of existing code

  return (
    <ScreenContainer scroll={false}>
      {/* Hero header */}
      <YStack paddingTop="$4" paddingBottom="$3" gap="$3">
        {/* ... existing header ... */}
      </YStack>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "custom" | "predefined")
        }
        orientation="horizontal"
        flexDirection="column"
        flex={1}
      >
        <Tabs.List
          backgroundColor="$bgSoft"
          borderRadius="$6"
          padding="$1"
          marginBottom="$3"
        >
          <Tabs.Tab
            value="custom"
            flex={1}
            backgroundColor={activeTab === "custom" ? "$bg" : "transparent"}
            borderRadius="$5"
          >
            <Text fontWeight={activeTab === "custom" ? "700" : "500"}>
              My Stickers
            </Text>
          </Tabs.Tab>
          <Tabs.Tab
            value="predefined"
            flex={1}
            backgroundColor={activeTab === "predefined" ? "$bg" : "transparent"}
            borderRadius="$5"
          >
            <Text fontWeight={activeTab === "predefined" ? "700" : "500"}>
              Pre-defined
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        {/* Custom Stickers Tab */}
        <Tabs.Content value="custom" flex={1}>
          {/* ... existing gallery code ... */}
        </Tabs.Content>

        {/* Predefined Stickers Tab */}
        <Tabs.Content value="predefined" flex={1}>
          <FlatList
            key={numColumns}
            data={predefinedStickers}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={{ paddingBottom: 24 }}
            columnWrapperStyle={{ gap: 16, paddingHorizontal: 4 }}
            ItemSeparatorComponent={() => <Stack height={16} />}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Stack flex={1}>
                <StickerCard
                  sticker={item}
                  onSend={handleSend}
                  onDelete={undefined} // Can't delete predefined
                  onLongPress={() => {}} // No long press for predefined
                  index={0}
                  isPredefined={true}
                />
              </Stack>
            )}
          />
        </Tabs.Content>
      </Tabs>

      {/* Add Sticker Modal - only for custom */}
      <AddStickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </ScreenContainer>
  );
}
```

---

#### Step 7: Update StickerCard Component

Modify `src/components/Sticker/StickerCard.tsx` to handle predefined stickers:

```typescript
type Props = {
  sticker: Sticker;
  onSend: (sticker: Sticker) => void;
  onDelete?: (id: string) => void; // Make optional
  onLongPress?: () => void; // Make optional
  index: number;
  isPredefined?: boolean; // NEW
};

export function StickerCard({
  sticker,
  onSend,
  onDelete,
  onLongPress,
  index,
  isPredefined = false,
}: Props) {
  const handleLongPress = () => {
    if (isPredefined || !onDelete) return; // Don't allow delete for predefined

    Alert.alert(
      "Delete Sticker",
      `Remove "${sticker.name}" from your collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(sticker.id),
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={() => onSend(sticker)}
      onLongPress={handleLongPress}
      // ... rest of component
    >
      {/* Show badge for predefined stickers */}
      {isPredefined && (
        <Stack
          position="absolute"
          top="$2"
          left="$2"
          backgroundColor="$primary"
          borderRadius="$4"
          paddingHorizontal="$2"
          paddingVertical="$1"
          zIndex={10}
        >
          <Text color="white" fontSize={10} fontWeight="700">
            PRE-DEFINED
          </Text>
        </Stack>
      )}

      {/* ... rest of card UI ... */}
    </Pressable>
  );
}
```

---

### Phase 2: Remote Configuration (Future Enhancement)

#### Step 1: Create Firebase Storage Structure

```
/stickers/
  /predefined/
    /v1/
      manifest.json
      heart.png
      kiss.png
      ...
```

#### Step 2: Update Service to Fetch Remote Stickers

```typescript
class PredefinedStickersService {
  private remoteManifestUrl =
    "https://your-cdn.com/stickers/predefined/v1/manifest.json";

  async getRemoteStickers(): Promise<Sticker[]> {
    try {
      const response = await fetch(this.remoteManifestUrl);
      const manifest: PredefinedStickerManifest = await response.json();

      return manifest.stickers.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: `https://your-cdn.com/stickers/predefined/v1/${item.filename}`,
        createdBy: "system",
        createdAt: 0,
        isPredefined: true,
        category: item.category,
        tags: item.tags,
      }));
    } catch (error) {
      console.error("Failed to fetch remote stickers:", error);
      // Fallback to local stickers
      return this.getAll();
    }
  }
}
```

---

## 🎨 Design Considerations

### Visual Differentiation

1. **Badge/Label**: Show "Pre-defined" badge on stickers
2. **Separate Tabs**: Clear separation between custom and pre-defined
3. **Category Filters**: Allow filtering by category (Love, Greetings, etc.)
4. **Search**: Enable search across all stickers

### User Interaction

1. **Tap to Send**: Single tap sends sticker immediately
2. **No Delete**: Pre-defined stickers can't be deleted
3. **Add to Favorites**: Option to "favorite" frequently used pre-defined stickers
4. **Preview**: Show larger preview before sending

---

## 📊 Recommended Sticker Categories

### Essential Categories (20-30 stickers)

1. **Love & Romance** (5-7 stickers)

   - Heart, Kiss, Hug, Love You, Miss You

2. **Greetings** (4-5 stickers)

   - Good Morning, Good Night, Hello, Goodbye

3. **Emotions** (5-7 stickers)

   - Happy, Sad, Excited, Thinking, Laughing

4. **Activities** (4-5 stickers)

   - Eating, Sleeping, Working, Exercising

5. **Celebrations** (3-4 stickers)
   - Birthday, Anniversary, Congratulations

---

## 🚀 Rollout Strategy

### Phase 1: MVP (Week 1-2)

- [ ] Create 20 high-quality sticker assets
- [ ] Implement local asset bundle approach
- [ ] Add tabs to stickers screen
- [ ] Test sending pre-defined stickers

### Phase 2: Enhancement (Week 3-4)

- [ ] Add category filtering
- [ ] Implement search functionality
- [ ] Add "favorite" pre-defined stickers feature
- [ ] Collect user feedback

### Phase 3: Scale (Month 2+)

- [ ] Migrate to remote configuration
- [ ] Add seasonal/themed sticker packs
- [ ] Implement A/B testing for new stickers
- [ ] Allow users to suggest new stickers

---

## 🔍 Testing Checklist

- [ ] Stickers load correctly on both iOS and Android
- [ ] Tabs switch smoothly between custom and pre-defined
- [ ] Pre-defined stickers can be sent successfully
- [ ] Pre-defined stickers can't be deleted
- [ ] Images are optimized and load quickly
- [ ] Works offline (for local assets)
- [ ] Graceful fallback if remote stickers fail to load
- [ ] Accessibility: Screen reader support
- [ ] Performance: No lag with 50+ stickers

---

## 💰 Cost Considerations

### Local Asset Bundle

- **Storage**: ~2-5 MB for 30 stickers (included in app bundle)
- **Bandwidth**: $0 (no additional costs)
- **Total**: $0/month

### Remote Configuration

- **Storage**: ~$0.01/month (Firebase Storage)
- **Bandwidth**: ~$0.10/month for 1000 users (assuming 5 MB download)
- **CDN**: Consider Cloudinary free tier (25 GB/month)
- **Total**: ~$0.11/month

---

## 🎯 Success Metrics

Track these metrics to measure feature success:

1. **Adoption Rate**: % of users who send pre-defined stickers
2. **Usage Frequency**: Average pre-defined stickers sent per user per week
3. **Popular Stickers**: Which stickers are sent most often
4. **Custom vs Pre-defined**: Ratio of custom to pre-defined sticker usage
5. **Retention**: Do users with pre-defined stickers have better retention?

---

## 🔗 Related Features

This feature pairs well with:

1. **Sticker Packs**: Allow users to create themed collections
2. **Animated Stickers**: Add GIF support for more expressive stickers
3. **Sticker Reactions**: Quick reactions to messages using stickers
4. **Custom Sticker Creator**: In-app sticker editor with filters/effects

---

## 📚 Resources

### Design Inspiration

- Telegram Stickers
- WhatsApp Stickers
- iMessage Sticker Packs
- LINE Stickers

### Asset Sources

- [Flaticon](https://www.flaticon.com/) - Free icons and stickers
- [Freepik](https://www.freepik.com/) - Free vector graphics
- [Lottie Files](https://lottiefiles.com/) - Animated stickers
- Custom design using Figma/Adobe Illustrator

### Technical References

- [Expo Asset Documentation](https://docs.expo.dev/versions/latest/sdk/asset/)
- [React Native Image Optimization](https://reactnative.dev/docs/image)
- [Firebase Storage Best Practices](https://firebase.google.com/docs/storage/best-practices)

---

## ❓ FAQ

### Q: Should pre-defined stickers be saved to Firestore?

**A:** No, they should only exist in the app. When sent, they're included in the notification payload but not stored as "stickers" in the database.

### Q: Can users customize pre-defined stickers?

**A:** In the MVP, no. In future versions, you could allow users to add text overlays or filters.

### Q: How many stickers should we start with?

**A:** Start with 20-30 high-quality stickers covering essential emotions and greetings. Add more based on user feedback.

### Q: Should we allow users to add pre-defined stickers to their custom collection?

**A:** Yes! Add a "Save to My Stickers" option that creates a copy in their custom collection.

### Q: What about licensing for sticker images?

**A:** Use royalty-free sources or create custom designs. Always check licenses before bundling third-party assets.

---

## 🎉 Next Steps

1. **Review this guide** and decide on implementation approach
2. **Create or source sticker assets** (20-30 images)
3. **Implement Phase 1** (local asset bundle)
4. **Test thoroughly** on both platforms
5. **Gather user feedback** and iterate
6. **Plan Phase 2** enhancements based on usage data

---

_Last updated: December 2024_
