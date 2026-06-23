import { CONFIG } from "@/constants/Config";
import { z } from "zod";

// --- DTOs ---

export const signupSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export const logoutSchema = z.object({
  refreshToken: z.string(),
});

export const userResponseSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string().email(),
  role: z.string(),
  firstname: z.string().nullable(),
  lastname: z.string().nullable(),
  created_at: z.string(),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const messageResponseSchema = z.object({
  message: z.string(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userResponseSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

// --- API ---

const extractErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  const parsed = messageResponseSchema.safeParse(
    await response.json().catch(() => ({})),
  );
  return parsed.success ? parsed.data.message : fallback;
};

export const AuthAPI = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, "Login failed"));
    }

    return tokenResponseSchema.parse(await response.json());
  },

  signup: async (input: SignupInput): Promise<TokenResponse | null> => {
    const response = await fetch(`${CONFIG.API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response, "Signup failed"));
    }

    // Some backends return tokens on signup, some only a confirmation message.
    const tokens = tokenResponseSchema.safeParse(await response.json());
    return tokens.success ? tokens.data : null;
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await fetch(`${CONFIG.API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return tokenResponseSchema.parse(await response.json());
  },

  logout: async (refreshToken: string | null): Promise<void> => {
    await fetch(`${CONFIG.API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  },

  getMe: async (
    fetcher: (url: string, init?: RequestInit) => Promise<Response>,
  ): Promise<User> => {
    const response = await fetcher(`${CONFIG.API_URL}/auth/me`);

    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }

    return userResponseSchema.parse(await response.json());
  },
};
