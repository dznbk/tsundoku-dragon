import { Hono } from 'hono';
import type { Env } from '../types/env';
import { getAuthUserId } from '../middleware/auth';
import { SkillService } from '../services/skillService';

const skills = new Hono<{ Bindings: Env }>();

skills.get('/', async (c) => {
  const userId = getAuthUserId(c);
  const service = new SkillService(c.env);
  const result = await service.getSkills(userId);
  return c.json(result);
});

export default skills;
