import { useAuth } from "@/contexts/AuthContext";
import {
  makeRedirectUri,
  ResponseType,
  useAuthRequest,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

// Endpoint discovery
const discovery = {
  authorizationEndpoint:
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  tokenEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
};

// Azure Client ID
const CLIENT_ID = "YOUR_CLIENT_ID_HERE"; // TODO: Gets from env or user input

export function useMicrosoftAuth() {
  const { signInWithTokens } = useAuth();

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["openid", "profile", "email", "User.Read"],
      redirectUri: makeRedirectUri({
        scheme: "appbdj",
        path: "auth",
      }),
      responseType: ResponseType.Token,
      extraParams: {
        prompt: "select_account",
      },
    },
    discovery,
  );

  const handleBackendExchange = useCallback(
    async (microsoftToken: string) => {
      try {
        // TODO: Replace with your actual backend URL from context or env
        // Using the one found in AuthContext: http://172.17.250.119:3000
        const API_URL = "http://172.17.250.119:3000";

        const res = await fetch(`${API_URL}/auth/microsoft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: microsoftToken }),
        });

        if (!res.ok) {
          throw new Error("Failed to authenticate with backend");
        }

        const data = await res.json();
        await signInWithTokens(data.accessToken, data.refreshToken);
      } catch (error) {
        console.error("Microsoft Login Backend Error:", error);
        // Handle error (e.g., show alert)
      }
    },
    [signInWithTokens],
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      handleBackendExchange(access_token);
    }
  }, [response, handleBackendExchange]);

  return { request, promptAsync };
}
