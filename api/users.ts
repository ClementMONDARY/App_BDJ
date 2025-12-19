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
};
