import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  isbn: z.string().optional(),
  totalPages: z.number().int().positive('ページ数は1以上の整数です'),
  skills: z.array(z.string()).optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

export const updateBookSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').optional(),
  totalPages: z.number().int().positive('ページ数は1以上の整数です').optional(),
  skills: z.array(z.string()).optional(),
});

export type UpdateBookInput = z.infer<typeof updateBookSchema>;

export const logsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
});

export type LogsQuery = z.infer<typeof logsQuerySchema>;

export const createBattleLogSchema = z.object({
  pagesRead: z.number().int().positive('ページ数は1以上の整数です'),
  memo: z.string().max(1000, 'メモは1000文字以内です').optional(),
});

export type CreateBattleLogInput = z.infer<typeof createBattleLogSchema>;
