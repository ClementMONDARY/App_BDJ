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
};
