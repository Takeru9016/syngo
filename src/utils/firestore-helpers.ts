import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import {
  userProfileConverter,
  todoConverter,
  favoriteConverter,
  stickerConverter,
  notificationConverter,
  pairConverter,
  pairCodeConverter,
} from "./firestore-converters";
import {
  UserProfile,
  Todo,
  Favorite,
  Sticker,
  Notification,
  Pair,
  PairCode,
} from "@/types";

// Collection references with converters
export const usersCollection = () =>
  collection(db, "users").withConverter(
    userProfileConverter
  ) as CollectionReference<UserProfile>;

export const todosCollection = () =>
  collection(db, "todos").withConverter(
    todoConverter
  ) as CollectionReference<Todo>;

export const favoritesCollection = () =>
  collection(db, "favorites").withConverter(
    favoriteConverter
  ) as CollectionReference<Favorite>;

export const stickersCollection = () =>
  collection(db, "stickers").withConverter(
    stickerConverter
  ) as CollectionReference<Sticker>;

export const notificationsCollection = () =>
  collection(db, "notifications").withConverter(
    notificationConverter
  ) as CollectionReference<Notification>;

export const pairsCollection = () =>
  collection(db, "pairs").withConverter(
    pairConverter
  ) as CollectionReference<Pair>;

export const pairCodesCollection = () =>
  collection(db, "pairCodes").withConverter(
    pairCodeConverter
  ) as CollectionReference<PairCode>;

// Document references with converters
export const userDoc = (uid: string) =>
  doc(db, "users", uid).withConverter(
    userProfileConverter
  ) as DocumentReference<UserProfile>;

export const todoDoc = (todoId: string) =>
  doc(db, "todos", todoId).withConverter(
    todoConverter
  ) as DocumentReference<Todo>;

export const favoriteDoc = (favoriteId: string) =>
  doc(db, "favorites", favoriteId).withConverter(
    favoriteConverter
  ) as DocumentReference<Favorite>;

export const stickerDoc = (stickerId: string) =>
  doc(db, "stickers", stickerId).withConverter(
    stickerConverter
  ) as DocumentReference<Sticker>;

export const notificationDoc = (notificationId: string) =>
  doc(db, "notifications", notificationId).withConverter(
    notificationConverter
  ) as DocumentReference<Notification>;

export const pairDoc = (pairId: string) =>
  doc(db, "pairs", pairId).withConverter(
    pairConverter
  ) as DocumentReference<Pair>;

export const pairCodeDoc = (code: string) =>
  doc(db, "pairCodes", code).withConverter(
    pairCodeConverter
  ) as DocumentReference<PairCode>;
