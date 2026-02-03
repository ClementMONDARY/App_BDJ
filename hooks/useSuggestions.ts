import { SuggestionsAPI } from "@/api/suggestions";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export function useSuggestions() {
  const { authenticatedFetch } = useAuth();

  const {
    data: suggestions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["suggestions"],
    queryFn: () => SuggestionsAPI.fetchSuggestions(authenticatedFetch),
  });

  return {
    suggestions,
    loading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    refetch,
  };
}
