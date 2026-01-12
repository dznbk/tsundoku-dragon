import type { User } from 'firebase/auth';
import { ApiError } from './bookApi';

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

export async function getSkills(user: User): Promise<SkillsResponse> {
  const token = await user.getIdToken();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const response = await fetch(`${apiUrl}/skills`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new ApiError('Failed to fetch skills', response.status);
  }

  return response.json();
}
