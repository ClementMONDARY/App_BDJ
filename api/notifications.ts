import { CONFIG } from "@/constants/Config";

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  content: string;
  resource_data: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export const NotificationsAPI = {
  fetchAll: async (
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<Notification[]> => {
    try {
      const response = await fetcher(`${CONFIG.API_URL}/notifications`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  markAsRead: async (
    id: number,
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<void> => {
    try {
      const response = await fetcher(
        `${CONFIG.API_URL}/notifications/${id}/read`,
        {
          method: "PATCH",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  delete: async (
    id: number,
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<void> => {
    try {
      const response = await fetcher(`${CONFIG.API_URL}/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};
