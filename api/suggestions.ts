import { CONFIG } from "@/constants/Config";

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  user_vote?: "up" | "down" | null;
}

export const SuggestionsAPI = {
  fetchSuggestions: async (
    fetcher?: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<Suggestion[]> => {
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };

      const doFetch = fetcher || fetch;

      const response = await doFetch(`${CONFIG.API_URL}/suggestions/public`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      throw error;
    }
  },

  submitSuggestion: async (
    title: string,
    content: string,
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<void> => {
    const response = await fetcher(`${CONFIG.API_URL}/suggestions/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Échec de l'envoi");
    }
  },

  voteSuggestion: async (
    id: string,
    type: "up" | "down",
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<void> => {
    const response = await fetcher(`${CONFIG.API_URL}/suggestions/${id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Échec du vote");
    }
  },
};
