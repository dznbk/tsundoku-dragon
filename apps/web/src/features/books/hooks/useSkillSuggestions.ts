import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

interface SkillsResponse {
  globalSkills: string[];
  userSkills: string[];
}

export function useSkillSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSuggestions([]);
      return;
    }

    const fetchSkills = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/skills`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }

        const data: SkillsResponse = await response.json();
        // グローバルスキルとユーザースキルを結合し、重複を除去
        const allSkills = [
          ...new Set([...data.globalSkills, ...data.userSkills]),
        ];
        setSuggestions(allSkills);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, [user]);

  return { suggestions, isLoading, error };
}
