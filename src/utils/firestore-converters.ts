import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";

import {
  UserProfile,
  Todo,
  Favorite,
  Sticker,
  Notification,
  Pair,
  PairCode,
} from "@/types";

// Helper to convert Firestore timestamp to number
function timestampToNumber(
  timestamp: Timestamp | number | undefined
): number | undefined {
  if (!timestamp) return undefined;
  if (typeof timestamp === "number") return timestamp;
  return timestamp.toMillis();
}

// User Profile Converter
export const userProfileConverter = {
  toFirestore(profile: Partial<UserProfile>): DocumentData {
    return {
      uid: profile.uid,
      displayName: profile.displayName,
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
      pairId: profile.pairId || null,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): UserProfile {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      uid: data.uid,
      displayName: data.displayName,
      bio: data.bio || "",
      avatarUrl: data.avatarUrl || "",
      pairId: data.pairId || undefined,
    };
  },
};

// Todo Converter
export const todoConverter = {
  toFirestore(todo: Partial<Todo>): DocumentData {
    return {
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      isCompleted: todo.isCompleted ?? false,
      dueDate: todo.dueDate ? Timestamp.fromMillis(todo.dueDate) : null,
      createdBy: todo.createdBy,
      createdAt: todo.createdAt
        ? Timestamp.fromMillis(todo.createdAt)
        : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Todo {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: data.title,
      description: data.description || "",
      priority: data.priority,
      isCompleted: data.isCompleted ?? false,
      dueDate: timestampToNumber(data.dueDate) || 0,
      createdBy: data.createdBy,
      createdAt: timestampToNumber(data.createdAt) || Date.now(),
    };
  },
};

// Favorite Converter
export const favoriteConverter = {
  toFirestore(favorite: Partial<Favorite>): DocumentData {
    return {
      title: favorite.title,
      category: favorite.category,
      description: favorite.description || "",
      imageUrl: favorite.imageUrl || "",
      url: favorite.url || "",
      createdBy: favorite.createdBy,
      createdAt: favorite.createdAt
        ? Timestamp.fromMillis(favorite.createdAt)
        : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Favorite {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: data.title,
      category: data.category,
      description: data.description || "",
      imageUrl: data.imageUrl || "",
      url: data.url || "",
      createdBy: data.createdBy,
      createdAt: timestampToNumber(data.createdAt) || Date.now(),
    };
  },
};

// Sticker Converter
export const stickerConverter = {
  toFirestore(sticker: Partial<Sticker>): DocumentData {
    return {
      name: sticker.name,
      imageUrl: sticker.imageUrl,
      createdBy: sticker.createdBy,
      createdAt: sticker.createdAt
        ? Timestamp.fromMillis(sticker.createdAt)
        : Timestamp.now(),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Sticker {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      imageUrl: data.imageUrl,
      createdBy: data.createdBy,
      createdAt: timestampToNumber(data.createdAt) || Date.now(),
    };
  },
};

// Notification Converter
export const notificationConverter = {
  toFirestore(notification: Partial<Notification>): DocumentData {
    return {
      type: notification.type,
      title: notification.title,
      message: notification.message,
      imageUrl: notification.imageUrl || "",
      createdBy: notification.createdBy,
      read: notification.read ?? false,
      createdAt: notification.createdAt
        ? Timestamp.fromMillis(notification.createdAt)
        : Timestamp.now(),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Notification {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      type: data.type,
      title: data.title,
      message: data.message,
      imageUrl: data.imageUrl || "",
      createdBy: data.createdBy,
      read: data.read ?? false,
      createdAt: timestampToNumber(data.createdAt) || Date.now(),
    };
  },
};

// Pair Converter
export const pairConverter = {
  toFirestore(pair: Partial<Pair>): DocumentData {
    return {
      participants: pair.participants,
      status: pair.status,
      createdAt: pair.createdAt
        ? Timestamp.fromMillis(pair.createdAt)
        : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Pair {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      participants: data.participants as [string, string],
      status: data.status,
      createdAt: timestampToNumber(data.createdAt) || Date.now(),
    };
  },
};

// Pair Code Converter
export const pairCodeConverter = {
  toFirestore(pairCode: Partial<PairCode>): DocumentData {
    return {
      code: pairCode.code,
      ownerUid: pairCode.ownerUid,
      pairId: pairCode.pairId || null,
      expiresAt: pairCode.expiresAt
        ? Timestamp.fromMillis(pairCode.expiresAt)
        : Timestamp.now(),
      createdAt: pairCode.createdAt
        ? Timestamp.fromMillis(pairCode.createdAt)
        : Timestamp.now(),
      used: pairCode.used ?? false,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): PairCode {
    const data = snapshot.data(options);
    return {
      code: data.code,
      ownerUid: data.ownerUid,
      pairId: data.pairId || undefined,
      expiresAt: timestampToNumber(data.expiresAt) || Date.now(),
      createdAt: timestampToNumber(data.createdAt) || Date.now(),
      used: data.used ?? false,
    };
  },
};
