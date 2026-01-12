import {
  SkillRepository,
  type UserSkillExp,
} from '../repositories/skillRepository';
import type { Env } from '../lib/dynamodb';

export interface SkillsResponse {
  globalSkills: string[];
  userSkills: string[];
  userSkillExps: UserSkillExp[];
}

export class SkillService {
  private repository: SkillRepository;

  constructor(env: Env) {
    this.repository = new SkillRepository(env);
  }

  async getSkills(userId: string): Promise<SkillsResponse> {
    const [globalSkills, userCustomSkills, userSkillExps] = await Promise.all([
      this.repository.findGlobalSkills(),
      this.repository.findUserCustomSkills(userId),
      this.repository.findUserSkillExps(userId),
    ]);

    return {
      globalSkills: globalSkills.map((s) => s.name),
      userSkills: userCustomSkills.map((s) => s.name),
      userSkillExps,
    };
  }
}
