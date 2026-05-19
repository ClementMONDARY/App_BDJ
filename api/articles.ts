import { CONFIG } from "@/constants/Config";
import { z } from "zod";

// --- DTOs ---

export const ZArticle = z.object({
  id: z.number().int(),
  author_id: z.number().int(),
  title: z.string().min(1),
  content: z.string().min(1),
  cover_image: z.string().nullable(),
  view_count: z.number().int().default(0),
  like_count: z.number().int().default(0),
  is_liked: z.boolean().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const ZArticleList = z.array(ZArticle);

export type Article = z.infer<typeof ZArticle>;
export type ArticleList = z.infer<typeof ZArticleList>;

// --- API ---

export const ArticlesAPI = {
  /**
   * GET /articles (Public)
   * List all articles.
   */
  fetchArticles: async (): Promise<ArticleList> => {
    const response = await fetch(`${CONFIG.API_URL}/articles`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch articles");
    }

    const data = await response.json();
    return ZArticleList.parse(data);
  },

  /**
   * GET /articles/:id (Public, is_liked field requires auth)
   * Get details of a single article.
   */
  fetchArticleById: async (
    id: number,
    fetcher?: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<Article> => {
    const doFetch = fetcher ?? fetch;
    const response = await doFetch(`${CONFIG.API_URL}/articles/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch article");
    }

    const data = await response.json();
    return ZArticle.parse(data);
  },

  /**
   * POST /articles/:id/like (User)
   * Toggle like status on an article.
   */
  likeArticle: async (
    id: number,
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<void> => {
    const response = await fetcher(`${CONFIG.API_URL}/articles/${id}/like`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to toggle like");
    }
  },
};
