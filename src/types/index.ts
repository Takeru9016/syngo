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

export type AppNotificationType =
  | "todo_created"
  | "todo_completed"
  | "favorite_added"
  | "sticker_sent"
  | "pair_connected"
  | "pair_request"
  | "pair_accepted"
  | "other";

export type AppNotification = {
  id: string;
  type: AppNotificationType;
  title: string;
  body: string;
  senderUid: string;
  recipientUid: string;
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
