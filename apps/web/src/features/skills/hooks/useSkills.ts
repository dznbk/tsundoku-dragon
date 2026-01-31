import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getSkills, type UserSkillExp } from '../../books/services/skillApi';

export interface UseSkillsResult {
  skills: UserSkillExp[];
  isLoading: boolean;
  error: string | null;
}

export function useSkills(): UseSkillsResult {
  const { user } = useAuth();
  const [skills, setSkills] = useState<UserSkillExp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getSkills(user);
      setSkills(response.userSkillExps);
    } catch {
      setError('スキルの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return {
    skills,
    isLoading,
    error,
  };
}
