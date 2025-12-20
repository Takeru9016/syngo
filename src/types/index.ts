export type TodoPriority = "low" | "medium" | "high";

export type Todo = {
  id: string;
  title: string;
  description: string;
  dueDate: number; // timestamp
  isCompleted: boolean;
  priority: TodoPriority;
  createdBy: string; // uid
  createdAt: number;
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
  imageUrl: string;
  createdBy: string;
  createdAt: number;
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
  | "todo_due_soon" // Cloud Function: todoDueReminders
  | "favorite_added" // Cloud Function: onFavoriteAdded
  | "sticker_sent" // Cloud Function: onStickerSent
  | "nudge" // Client-side: Thinking of you nudges
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

