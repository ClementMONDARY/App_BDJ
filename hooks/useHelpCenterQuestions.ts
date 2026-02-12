import { HelpCenterAPI } from "@/api/helpCenter";
import { useQuery } from "@tanstack/react-query";

export function useHelpCenterQuestions() {
  const {
    data: questions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: HelpCenterAPI.fetchQuestions,
  });

  return {
    questions,
    loading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    refetch,
  };
}
