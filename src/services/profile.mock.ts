import { UserProfile } from '@/types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let mockProfile: UserProfile = {
  uid: 'user1',
  displayName: 'You',
  avatarUrl: 'https://picsum.photos/seed/avatar1/200/200',
  bio: 'Living my best life with my partner ❤️',
  pairId: 'mock-pair-123',
};

let mockPartnerProfile: UserProfile = {
  uid: 'user2',
  displayName: 'Partner',
  avatarUrl: 'https://picsum.photos/seed/avatar2/200/200',
  bio: 'Always here for you 💕',
  pairId: 'mock-pair-123',
};

export async function getProfile(): Promise<UserProfile> {
  await delay(200);
  return { ...mockProfile };
}

export async function getPartnerProfile(): Promise<UserProfile | null> {
  await delay(200);
  return { ...mockPartnerProfile };
}

export async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
  await delay(300);
  mockProfile = { ...mockProfile, ...updates };
}