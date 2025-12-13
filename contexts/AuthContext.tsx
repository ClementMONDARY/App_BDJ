import * as SecureStore from "expo-secure-store";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: number;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
    firstname: string,
    lastname: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const API_URL = "https://dayle-wieldier-shemeka.ngrok-free.dev";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// Helpers outside component to ensure stability
const saveTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

const getAccessToken = async () => {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

const getRefreshToken = async () => {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await clearTokens();
      setUser(null);
    }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await saveTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      } else {
        await signOut();
        return null;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      await signOut();
      return null;
    }
  }, [signOut]);

  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      let token = await getAccessToken();

      const getOptions = (token: string | null) => ({
        ...options,
        headers: {
          ...options.headers,
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      let response = await fetch(url, getOptions(token));

      if (response.status === 401) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetch(url, getOptions(token));
        }
      }

      return response;
    },
    [refreshAccessToken],
  );

  const checkUser = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authenticatedFetch(`${API_URL}/auth/me`);

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        if (response.status === 401) {
          await clearTokens();
        }
      }
    } catch (error) {
      console.error("Check user error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        }

        const data = await response.json();
        await saveTokens(data.accessToken, data.refreshToken);

        await checkUser();
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [checkUser],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      firstname: string,
      lastname: string,
    ) => {
      try {
        const response = await fetch(`${API_URL}/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            username,
            firstname,
            lastname,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Signup failed");
        }

        const data = await response.json();
        if (data.accessToken && data.refreshToken) {
          await saveTokens(data.accessToken, data.refreshToken);
          await checkUser();
        }
      } catch (error) {
        console.error("Signup error:", error);
        throw error;
      }
    },
    [checkUser],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        getToken: getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
