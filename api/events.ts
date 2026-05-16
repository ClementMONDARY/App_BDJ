import { CONFIG } from "@/constants/Config";
import { z } from "zod";

// --- DTOs ---

export const ZEvent = z.object({
  id: z.number().int(),
  organizer_id: z.number().int(),
  title: z.string(),
  description: z.string(),
  cover_image: z.string().nullable(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  location: z.string(),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .nullable(),
  max_capacity: z.number().int().nullable(),
  current_attendees: z.number().int(),
  is_registered: z.boolean().nullish().transform((v) => v ?? false),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const ZEventList = z.array(ZEvent);

export type Event = z.infer<typeof ZEvent>;
export type EventList = z.infer<typeof ZEventList>;

// --- API ---

export const EventsAPI = {
  /**
   * GET /events (Public, is_registered field requires auth)
   * List all events.
   */
  fetchEvents: async (
    fetcher?: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<EventList> => {
    const doFetch = fetcher ?? fetch;
    const response = await doFetch(`${CONFIG.API_URL}/events`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const data = await response.json();
    return ZEventList.parse(data);
  },
};
