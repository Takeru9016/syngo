export type TodoPriority = "low" | "medium" | "high";

// Together List: List item type discriminator
export type ListItemType = "task" | "dream";

// Together List: Dream categories for bucket list items
export type DreamCategory =
  | "travel" // ✈️ Vacation spots, destinations
  | "food" // 🍕 Restaurants, dishes to try
  | "adventure" // 🎢 Experiences, activities
  | "together" // 💕 Couple-specific activities
  | "other"; // ✨ Miscellaneous

// Together List: Subtask for breaking down tasks
export type Subtask = {
  id: string; // UUID
  title: string;
  isCompleted: boolean;
  createdAt: number;
};

export type Todo = {
  id: string;
  title: string;
  description: string;
  dueDate?: number; // timestamp (optional for dreams)
  isCompleted: boolean;
  priority: TodoPriority;
  createdBy: string; // uid
  createdAt: number;

  // Type discriminator (defaults to "task" for backward compatibility)
  listType?: ListItemType;

  // Subtasks (for tasks only)
  subtasks?: Subtask[];

  // Dream-specific fields (optional)
  category?: DreamCategory;
  photos?: string[]; // Photos for inspiration
  completedDate?: number; // When achieved
  completedPhotos?: string[]; // Photos of the achievement
};

export type FavoriteCategory =
  | "movie"
  | "food"
  | "place"
  | "quote"
  | "link"
  | "other";

export type Favorite = {
  id: string;
  title: string;
  category: FavoriteCategory;
  description: string;
  imageUrl?: string;
  url?: string;
  createdBy: string;
  createdAt: number;
};

export type Sticker = {
  id: string;
  name: string;
  description?: string; // Optional description for the sticker
  imageUrl: string;
  createdBy: string;
  createdAt: number;
  isFavorite?: boolean; // Flag for favorite stickers
  isPredefined?: boolean; // Flag for pre-defined stickers
  category?: string; // Category for organization
  tags?: string[]; // Tags for search/filtering
};

export type NotificationType = "sticker" | "todo" | "favorite" | "note";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: number;
  read: boolean;
};

// Updated to match Cloud Functions notification types
export type AppNotificationType =
  | "todo_reminder" // Cloud Function: onTodoCreated, todoDueReminders
  | "todo_created" // Client-side
  | "todo_completed" // Client-side
  | "todo_updated" // Client-side
  | "todo_deleted" // Client-side
  | "todo_due_soon" // Cloud Function: todoDueReminders
  | "todo_overdue" // Cloud Function: todoDueReminders (overdue)
  | "favorite_added" // Cloud Function: onFavoriteAdded
  | "sticker_sent" // Cloud Function: onStickerSent
  | "nudge" // Client-side: Thinking of you nudges
  | "mood_updated" // Cloud Function: onMoodUpdated
  | "pair_success" // Cloud Function: redeemPairingCode
  | "pair_connected" // Client-side (alias for pair_success)
  | "pair_request" // Client-side
  | "pair_accepted" // Client-side
  | "unpair" // Client-side
  | "profile_updated" // Client-side
  | "other"; // Fallback

export type AppNotification = {
  id: string;
  type: AppNotificationType;
  title: string;
  body: string;
  recipientUid: string;
  senderUid?: string;
  pairId?: string | null;
  read: boolean;
  createdAt: number;
  data?: Record<string, any>;
};

export type UserProfile = {
  id: string;
  uid: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  pairId?: string;
  showOnboardingAfterUnpair?: boolean;
};

export type PairStatus = "active" | "inactive";

export type Pair = {
  id: string;
  participants: [string, string];
  status: PairStatus;
  createdAt: number;
};

// Pair Code
export type PairCode = {
  code: string;
  ownerUid: string;
  pairId?: string;
  expiresAt: number;
  createdAt: number;
  used: boolean;
};

export type HomeWidgetType =
  | "latest_notification"
  | "recent_todos"
  | "recent_favorites"
  | "recent_stickers";

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

// Mood Tracking Types
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type MoodEmoji = "😢" | "😔" | "😐" | "🙂" | "😊";

export const MOOD_EMOJIS: Record<MoodLevel, MoodEmoji> = {
  1: "😢", // Very sad
  2: "😔", // Sad
  3: "😐", // Neutral
  4: "🙂", // Happy
  5: "😊", // Very happy
};

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "Struggling",
  2: "Down",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export type MoodEntry = {
  id: string;
  userId: string;
  pairId: string;
  level: MoodLevel;
  note?: string; // Optional journal entry
  isPrivate: boolean; // If true, partner can't see this entry
  createdAt: number;
  updatedAt?: number;
};
