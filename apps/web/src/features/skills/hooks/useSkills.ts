import { useAuth } from '../../auth/hooks/useAuth';
import { getSkills, type UserSkillExp } from '../../books/services/skillApi';
import { useAsyncData } from '../../../shared/hooks/useAsyncData';

export interface UseSkillsResult {
  skills: UserSkillExp[];
  isLoading: boolean;
  error: string | null;
}

export function useSkills(): UseSkillsResult {
  const { user } = useAuth();

  const {
    data: skills,
    isLoading,
    error,
  } = useAsyncData(
    async () => {
      const response = await getSkills();
      return response.userSkillExps;
    },
    [user],
    [] as UserSkillExp[],
    {
      enabled: !!user,
      errorMessage: 'スキルの取得に失敗しました',
    }
  );

  return {
    skills,
    isLoading,
    error,
  };
}
