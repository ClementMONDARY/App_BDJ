import { CONFIG } from "@/constants/Config";

export interface Question {
  message: string;
  answer: string;
}

export const HelpCenterAPI = {
  fetchQuestions: async (): Promise<Question[]> => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/questions/public`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  },

  submitQuestion: async (
    message: string,
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<void> => {
    const response = await fetcher(`${CONFIG.API_URL}/questions/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Échec de l'envoi");
    }
  },
};
