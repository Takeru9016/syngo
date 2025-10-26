import { Sticker } from "@/types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let mockStickers: Sticker[] = [
  {
    id: "1",
    name: "Heart",
    imageUrl: "https://picsum.photos/seed/sticker1/200/200",
    createdBy: "user1",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "2",
    name: "Smile",
    imageUrl: "https://picsum.photos/seed/sticker2/200/200",
    createdBy: "user2",
    createdAt: Date.now() - 172800000,
  },
  {
    id: "3",
    name: "Hug",
    imageUrl: "https://picsum.photos/seed/sticker3/200/200",
    createdBy: "user1",
    createdAt: Date.now() - 259200000,
  },
  {
    id: "4",
    name: "Kiss",
    imageUrl: "https://picsum.photos/seed/sticker4/200/200",
    createdBy: "user2",
    createdAt: Date.now() - 345600000,
  },
  {
    id: "5",
    name: "Love",
    imageUrl: "https://picsum.photos/seed/sticker5/200/200",
    createdBy: "user1",
    createdAt: Date.now() - 432000000,
  },
  {
    id: "6",
    name: "Happy",
    imageUrl: "https://picsum.photos/seed/sticker6/200/200",
    createdBy: "user2",
    createdAt: Date.now() - 518400000,
  },
];

export async function getStickers(): Promise<Sticker[]> {
  await delay(300);
  return [...mockStickers];
}

export async function addSticker(
  sticker: Omit<Sticker, "id" | "createdAt">
): Promise<Sticker> {
  await delay(600);
  const newSticker: Sticker = {
    ...sticker,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  mockStickers.push(newSticker);
  return newSticker;
}

export async function deleteSticker(id: string): Promise<void> {
  await delay(300);
  mockStickers = mockStickers.filter((s) => s.id !== id);
}

export async function sendSticker(stickerId: string): Promise<void> {
  await delay(400);
  // Mock: creates a notification for partner
  console.log("Sticker sent:", stickerId);
}
