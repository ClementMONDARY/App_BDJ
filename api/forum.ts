import { z } from "zod";
import { CONFIG } from "@/constants/Config";

// --- DTOs ---

export const ZTopic = z.object({
  id: z.number().int(),
  author_id: z.number().int().nullable(),
  title: z.string(),
  content: z.string().nullable(),
  cover_image: z.string().nullable(),
  attachment_urls: z.array(z.string()).nullable(),
  view_count: z.number().int(),
  like_count: z.number().int(),
  msg_count: z.number().int(),
  is_followed: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export const ZTopicList = z.array(ZTopic);

export const ZTopicMessagersResponse = z.object({
  users_ids: z.array(z.number().int()),
});

export type Topic = z.infer<typeof ZTopic>;
export type TopicList = z.infer<typeof ZTopicList>;
export type TopicMessagersResponse = z.infer<typeof ZTopicMessagersResponse>;

// --- API ---

export const ForumAPI = {
  /**
   * GET /forum/topics (Public)
   * List all discussion topics.
   */
  fetchTopics: async (
    fetcher?: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<TopicList> => {
    const doFetch = fetcher ?? fetch;
    const response = await doFetch(`${CONFIG.API_URL}/forum/topics`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch forum topics");
    }

    const data = await response.json();
    return ZTopicList.parse(data);
  },

  /**
   * POST /forum/topics/:id/follow (Connected)
   * Toggle following a topic (creates or deletes the user-topic link).
   */
  followTopic: async (
    topicId: number,
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<void> => {
    const response = await fetcher(
      `${CONFIG.API_URL}/forum/topics/${topicId}/follow`,
      { method: "POST" },
    );

    if (!response.ok) {
      throw new Error(`Failed to toggle follow for topic ${topicId}`);
    }
  },

  /**
   * GET /forum/topics/:id/messagers (Public)
   * List users who replied to a topic.
   */
  fetchTopicMessagers: async (
    topicId: number,
  ): Promise<TopicMessagersResponse> => {
    const response = await fetch(
      `${CONFIG.API_URL}/forum/topics/${topicId}/messagers`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch messagers for topic ${topicId}`);
    }

    const data = await response.json();
    return ZTopicMessagersResponse.parse(data);
  },
};
