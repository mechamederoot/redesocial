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

// Função para comprimir imagem
const compressImage = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8,
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calcular nova dimensão mantendo proporção
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Converter para base64 comprimido
      const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedBase64);
    };

    img.src = URL.createObjectURL(file);
  });
};

export const createStoryWithFile = async (
  content: string,
  mediaFile: File | null,
  storyDuration: number,
  backgroundColor: string,
  privacy: string,
  userToken: string,
): Promise<boolean> => {
  console.log("🔥 Creating story with smart compression...");

  try {
    let mediaUrl: string | null = null;
    let mediaType: "text" | "photo" | "video" | "music" | null = "text";

    // If there's a media file, try upload first, fallback to compressed base64
    if (mediaFile) {
      console.log("📤 Trying file upload first...");

      // Try file upload first
      try {
        const formData = new FormData();
        formData.append("file", mediaFile);

        const uploadResponse = await fetch(
          "http://localhost:8000/upload/media",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          },
        );

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          mediaUrl = uploadResult.file_path;
          console.log("✅ File upload successful:", mediaUrl);
        } else {
          throw new Error("Upload failed");
        }
      } catch (uploadError) {
        console.log("📦 File upload failed, using compressed image...");

        // Fallback: compress image for base64 storage
        if (mediaFile.type.startsWith("image/")) {
          console.log("🗜️ Compressing image...");
          mediaUrl = await compressImage(mediaFile, 600, 0.7); // Compress to max 600px, 70% quality
          console.log("✅ Image compressed successfully");
        } else {
          console.error("❌ Cannot process non-image files without upload");
          return false;
        }
      }

      // Determine media type based on file
      if (mediaFile.type.startsWith("image/")) {
        mediaType = "photo";
      } else if (mediaFile.type.startsWith("video/")) {
        mediaType = "video";
      } else if (mediaFile.type.startsWith("audio/")) {
        mediaType = "music";
      }
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
