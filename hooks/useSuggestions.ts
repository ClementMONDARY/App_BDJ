import { type Suggestion, SuggestionsAPI } from "@/api/suggestions";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";

export function useSuggestions() {
  const { getToken } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const data = await SuggestionsAPI.fetchSuggestions(token || undefined);
      setSuggestions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return { suggestions, loading, error, refetch: fetchSuggestions };
}
