// Helper functions for story upload functionality

export interface StoryUploadData {
  content: string;
  media_type: "text" | "photo" | "video" | "music" | null;
  media_url?: string;
  duration_hours: number;
  background_color?: string;
  privacy: string;
  overlays?: any[];
}

export const uploadStoryMedia = async (
  file: File,
  userToken: string,
): Promise<string | null> => {
  if (!file) return null;

  console.log("🔥 Uploading story media file:", file.name);

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Try different upload endpoints
    const response = await fetch("http://localhost:8000/users/me/media", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Media upload successful:", data);
      return data.url || data.media_url || data.file_url;
    } else {
      console.error("❌ Media upload failed:", await response.text());
      return null;
    }
  } catch (error) {
    console.error("❌ Media upload error:", error);
    return null;
  }
};

export const createStoryWithFile = async (
  content: string,
  mediaFile: File | null,
  storyDuration: number,
  backgroundColor: string,
  privacy: string,
  userToken: string,
): Promise<boolean> => {
  console.log("🔥 Creating story with FormData approach...");

  try {
    let mediaUrl: string | null = null;
    let mediaType: "text" | "photo" | "video" | "music" | null = "text";

    // If there's a media file, convert to base64 for now (fallback approach)
    if (mediaFile) {
      console.log("📤 Converting media file to base64...");

      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(mediaFile);
      });

      mediaUrl = base64;

      // Determine media type based on file
      if (mediaFile.type.startsWith("image/")) {
        mediaType = "photo";
      } else if (mediaFile.type.startsWith("video/")) {
        mediaType = "video";
      } else if (mediaFile.type.startsWith("audio/")) {
        mediaType = "music";
      }

      console.log("✅ Media converted to base64 successfully");
    }

    // Create story payload
    const payload: StoryUploadData = {
      content,
      media_type: mediaType,
      media_url: mediaUrl,
      duration_hours: storyDuration,
      background_color: backgroundColor,
      privacy,
      overlays: [],
    };

    console.log("📤 Creating story with payload:", payload);

    const response = await fetch("http://localhost:8000/stories/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Story created successfully:", result);
      return true;
    } else {
      const errorData = await response.text();
      console.error("❌ Story creation failed:", errorData);
      console.error("Response status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Story creation error:", error);
    return false;
  }
};
