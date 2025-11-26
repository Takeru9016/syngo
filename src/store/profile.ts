import { create } from "zustand";

import { UserProfile } from "@/types";
import * as profileService from "@/services/profile/profile.service";

export type ProfileState = {
  // State
  profile: UserProfile | null;
  partnerProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProfile: () => Promise<void>;
  loadPartnerProfile: () => Promise<void>;
  updateProfileData: (
    updates: Partial<Omit<UserProfile, "id" | "uid">>
  ) => Promise<void>;
  uploadAvatar: (localUri: string) => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
  setPartnerProfile: (profile: UserProfile | null) => void;
  reset: () => void;
  clearError: () => void;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  partnerProfile: null,
  isLoading: false,
  error: null,

  // Load current user's profile
  loadProfile: async () => {
    try {
      set({ isLoading: true, error: null });

      const profile = await profileService.getProfile();

      set({
        profile,
        isLoading: false,
      });


    } catch (error: any) {
      console.error("❌ Error loading profile:", error.message);

      set({
        error: "Failed to load profile",
        isLoading: false,
      });
    }
  },

  // Load partner's profile
  loadPartnerProfile: async () => {
    try {
      const partnerProfile = await profileService.getPartnerProfile();

      set({ partnerProfile });


    } catch (error: any) {
      console.error("❌ Error loading partner profile:", error.message);
    }
  },

  // Update profile
  updateProfileData: async (updates) => {
    try {
      set({ isLoading: true, error: null });

      await profileService.updateProfile(updates);

      // Reload profile to get updated data
      const profile = await profileService.getProfile();

      set({
        profile,
        isLoading: false,
      });


    } catch (error: any) {
      console.error("❌ Error updating profile:", error.message);

      set({
        error: "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (localUri: string) => {
    try {
      set({ isLoading: true, error: null });

      const avatarUrl = await profileService.uploadAvatar(localUri);

      // Update local state
      const currentProfile = get().profile;
      if (currentProfile) {
        set({
          profile: {
            ...currentProfile,
            avatarUrl,
          },
          isLoading: false,
        });
      }


    } catch (error: any) {
      console.error("❌ Error uploading avatar:", error.message);

      set({
        error: "Failed to upload avatar",
        isLoading: false,
      });

      throw error; // Re-throw so UI can handle it
    }
  },

  // Set profile (used by listeners)
  setProfile: (profile) => {
    set({ profile });
  },

  // Set partner profile (used by listeners)
  setPartnerProfile: (partnerProfile) => {
    set({ partnerProfile });
  },

  // Reset state
  reset: () => {
    set({
      profile: null,
      partnerProfile: null,
      isLoading: false,
      error: null,
    });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
