import Constants from "expo-constants";

const CLOUD_NAME = Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = Constants.expoConfig?.extra
  ?.CLOUDINARY_UNSIGNED_PRESET as string;

export type UploadResult = {
  url: string;
  publicId: string;
};

export type UploadOptions = {
  folder?: string;
};

export const CloudinaryStorage = {
  /**
   * Upload an image to Cloudinary
   * @param localUri - Local file URI from image picker
   * @param options - Upload options (folder, etc.)
   * @returns Upload result with URL and public ID
   */
  async upload(
    localUri: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      console.error("❌ Cloudinary config missing:", {
        CLOUD_NAME,
        UPLOAD_PRESET,
      });
      throw new Error("Cloudinary not configured. Check your .env file.");
    }

    console.log("📤 Uploading to Cloudinary...");
    console.log("   Local URI:", localUri);
    console.log("   Cloud Name:", CLOUD_NAME);
    console.log("   Upload Preset:", UPLOAD_PRESET);
    console.log("   Folder:", options?.folder || "none");

    const form = new FormData();

    // Append file (React Native FormData format)
    form.append("file", {
      uri: localUri,
      name: "upload.jpg",
      type: "image/jpeg",
    } as any);

    form.append("upload_preset", UPLOAD_PRESET);

    if (options?.folder) {
      form.append("folder", options.folder);
    }

    try {
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      console.log("   Upload URL:", uploadUrl);

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        console.error("❌ Cloudinary upload failed:", json.error);
        throw new Error(json.error?.message || "Upload failed");
      }

      console.log("✅ Cloudinary upload success!");
      console.log("   Secure URL:", json.secure_url);
      console.log("   Public ID:", json.public_id);

      // IMPORTANT: Return secure_url from Cloudinary, not the local URI
      return {
        url: json.secure_url, // This is the Cloudinary CDN URL
        publicId: json.public_id,
      };
    } catch (error: any) {
      console.error("❌ Cloudinary upload error:", error);
      console.error("   Error message:", error.message);
      throw new Error(error.message || "Failed to upload image");
    }
  },
};
