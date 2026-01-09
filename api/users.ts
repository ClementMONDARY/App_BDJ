import { CONFIG } from "@/constants/Config";

export interface PublicUser {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  role: "user" | "admin" | "moderator";
}

export const UsersAPI = {
  getUserPublicInfo: async (id: string): Promise<PublicUser> => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/users/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  },

  deleteAccount: async (id: string, token: string): Promise<void> => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  },

  uploadAvatar: async (
    imageUri: string,
    token: string,
  ): Promise<{ avatar: string }> => {
    try {
      const formData = new FormData();

      // @ts-expect-error - React Native FormData expects specific object structure
      formData.append("file", {
        uri: imageUri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(`${CONFIG.API_URL}/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload avatar");
      }

      return data;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },
};
