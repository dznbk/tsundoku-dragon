import { apiClient } from '../../../lib/apiClient';

export interface UserSkillExp {
  name: string;
  exp: number;
  level: number;
}

export interface SkillsResponse {
  globalSkills: string[];
  userSkills: string[];
  userSkillExps: UserSkillExp[];
}

export async function getSkills(): Promise<SkillsResponse> {
  return apiClient.get<SkillsResponse>('/skills');
}
