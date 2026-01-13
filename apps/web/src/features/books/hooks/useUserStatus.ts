import { useEffect, useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useAuth } from '../../auth/hooks/useAuth';
import { getSkills } from '../services/skillApi';
import {
  completedCountAtom,
  totalPagesReadAtom,
  topSkillsAtom,
  userSkillExpsAtom,
  skillsLoadingAtom,
} from '../stores/homeAtoms';

export function useUserStatus() {
  const { user } = useAuth();
  const completedCount = useAtomValue(completedCountAtom);
  const totalPagesRead = useAtomValue(totalPagesReadAtom);
  const topSkills = useAtomValue(topSkillsAtom);
  const [, setUserSkillExps] = useAtom(userSkillExpsAtom);
  const [isLoading, setIsLoading] = useAtom(skillsLoadingAtom);

  const fetchSkills = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const response = await getSkills(user);
      setUserSkillExps(response.userSkillExps);
    } catch {
      // スキル取得失敗時は空のままにする（必須機能ではないため）
    } finally {
      setIsLoading(false);
    }
  }, [user, setUserSkillExps, setIsLoading]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return {
    userName: user?.displayName || '冒険者',
    completedCount,
    totalPagesRead,
    topSkills,
    isLoading,
  };
}
