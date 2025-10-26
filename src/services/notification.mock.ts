import { Notification } from '@/types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'sticker',
    title: 'New sticker from Partner',
    message: 'Partner sent you a Heart sticker',
    imageUrl: 'https://picsum.photos/seed/sticker1/200/200',
    createdBy: 'user2',
    createdAt: Date.now() - 3600000,
    read: false,
  },
  {
    id: '2',
    type: 'todo',
    title: 'Reminder: Movie night',
    message: 'Your reminder is due in 1 hour',
    createdBy: 'user1',
    createdAt: Date.now() - 7200000,
    read: true,
  },
];

export async function getNotifications(): Promise<Notification[]> {
  await delay(300);
  return [...mockNotifications].sort((a, b) => b.createdAt - a.createdAt);
}

export async function getLatestNotification(): Promise<Notification | null> {
  await delay(200);
  const sorted = [...mockNotifications].sort((a, b) => b.createdAt - a.createdAt);
  return sorted[0] || null;
}

export async function markAsRead(id: string): Promise<void> {
  await delay(200);
  const notif = mockNotifications.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
  }
}