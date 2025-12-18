import { HelpCenterAPI, type Question } from "@/api/helpCenter";
import { useCallback, useEffect, useState } from "react";

export function useHelpCenterQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await HelpCenterAPI.fetchQuestions();
      setQuestions(data);
    } catch (err) {
      setError("Impossible de charger les questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, loading, error, refetch: fetchQuestions };
}
