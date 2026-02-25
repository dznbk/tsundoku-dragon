import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types/env';
import { getAuthUserId } from '../middleware/auth';
import { BookService } from '../services/bookService';
import { BattleService } from '../services/battleService';
import {
  createBookSchema,
  updateBookSchema,
  logsQuerySchema,
  createBattleLogSchema,
} from '../types/api';

const books = new Hono<{ Bindings: Env }>();

books.post('/', zValidator('json', createBookSchema), async (c) => {
  const input = c.req.valid('json');
  const userId = getAuthUserId(c);
  const service = new BookService(c.env);
  const book = await service.createBook(userId, input);
  return c.json(book, 201);
});

books.get('/', async (c) => {
  const userId = getAuthUserId(c);
  const service = new BookService(c.env);
  const bookList = await service.listBooks(userId);
  return c.json({ books: bookList });
});

books.get('/:id', async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const service = new BookService(c.env);
  const book = await service.getBook(userId, bookId);
  return c.json(book);
});

books.put('/:id', zValidator('json', updateBookSchema), async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const input = c.req.valid('json');
  const service = new BookService(c.env);
  const book = await service.updateBook(userId, bookId, input);
  return c.json(book);
});

books.delete('/:id', async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const service = new BookService(c.env);
  await service.archiveBook(userId, bookId);
  return c.body(null, 204);
});

books.post('/:id/reset', async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const service = new BookService(c.env);
  const book = await service.resetBook(userId, bookId);
  return c.json(book);
});

books.get('/:id/logs', zValidator('query', logsQuerySchema), async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const query = c.req.valid('query');
  const service = new BattleService(c.env);

  const result = await service.getBookLogs(userId, bookId, {
    limit: query.limit,
    cursor: query.cursor,
  });

  return c.json(result);
});

books.post(
  '/:id/logs',
  zValidator('json', createBattleLogSchema),
  async (c) => {
    const userId = getAuthUserId(c);
    const bookId = c.req.param('id');
    const input = c.req.valid('json');
    const service = new BattleService(c.env);
    const result = await service.recordBattle(userId, bookId, input);
    return c.json(result, 201);
  }
);

export default books;
