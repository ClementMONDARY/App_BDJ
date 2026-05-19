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
  is_registered: z
    .boolean()
    .nullish()
    .transform((v) => v ?? false),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const ZEventList = z.array(ZEvent);

export const ZRegistration = z.object({
  id: z.number().int(),
  event_id: z.number().int(),
  user_id: z.number().int(),
  status: z.enum(["registered", "cancelled", "waitlist"]),
  registered_at: z.coerce.date(),
});

export type Event = z.infer<typeof ZEvent>;
export type EventList = z.infer<typeof ZEventList>;
export type Registration = z.infer<typeof ZRegistration>;

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

  /**
   * GET /events/:id (Public, is_registered field requires auth)
   * Get details of a specific event.
   */
  fetchEventById: async (
    id: number,
    fetcher?: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<Event> => {
    const doFetch = fetcher ?? fetch;
    const response = await doFetch(`${CONFIG.API_URL}/events/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch event");
    }

    const data = await response.json();
    return ZEvent.parse(data);
  },

  /**
   * POST /events/:id/register (User)
   * Register the authenticated user for an event.
   */
  registerToEvent: async (
    id: number,
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<Registration> => {
    const response = await fetcher(`${CONFIG.API_URL}/events/${id}/register`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to register to event");
    }

    const data = await response.json();
    return ZRegistration.parse(data);
  },

  /**
   * DELETE /events/:id/register (User)
   * Unregister the authenticated user from an event.
   */
  unregisterFromEvent: async (
    id: number,
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<void> => {
    const response = await fetcher(`${CONFIG.API_URL}/events/${id}/register`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to unregister from event");
    }
  },
};
