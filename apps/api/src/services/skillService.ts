import { SkillRepository } from '../repositories/skillRepository';
import type { Env } from '../lib/dynamodb';

export interface SkillsResponse {
  globalSkills: string[];
  userSkills: string[];
}

export class SkillService {
  private repository: SkillRepository;

  constructor(env: Env) {
    this.repository = new SkillRepository(env);
  }

  async getSkills(userId: string): Promise<SkillsResponse> {
    const [globalSkills, userCustomSkills] = await Promise.all([
      this.repository.findGlobalSkills(),
      this.repository.findUserCustomSkills(userId),
    ]);

    return {
      globalSkills: globalSkills.map((s) => s.name),
      userSkills: userCustomSkills.map((s) => s.name),
    };
  }
}
