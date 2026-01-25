import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types/env';
import { getAuthUserId } from '../middleware/auth';
import { BookService } from '../services/bookService';
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
  if (!book) {
    return c.json({ error: 'Book not found' }, 404);
  }
  return c.json(book);
});

books.put('/:id', zValidator('json', updateBookSchema), async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const input = c.req.valid('json');
  const service = new BookService(c.env);

  try {
    const book = await service.updateBook(userId, bookId, input);
    if (!book) {
      return c.json({ error: 'Book not found' }, 404);
    }
    return c.json(book);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Cannot update archived book'
    ) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

books.delete('/:id', async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const service = new BookService(c.env);

  try {
    const success = await service.archiveBook(userId, bookId);
    if (!success) {
      return c.json({ error: 'Book not found' }, 404);
    }
    return c.body(null, 204);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Book is already archived'
    ) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

books.post('/:id/reset', async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const service = new BookService(c.env);

  try {
    const book = await service.resetBook(userId, bookId);
    if (!book) {
      return c.json({ error: 'Book not found' }, 404);
    }
    return c.json(book);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Can only reset completed books'
    ) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

books.get('/:id/logs', zValidator('query', logsQuerySchema), async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const query = c.req.valid('query');
  const service = new BookService(c.env);

  const result = await service.getBookLogs(userId, bookId, {
    limit: query.limit,
    cursor: query.cursor,
  });

  if (!result) {
    return c.json({ error: 'Book not found' }, 404);
  }

  return c.json(result);
});

books.post(
  '/:id/logs',
  zValidator('json', createBattleLogSchema),
  async (c) => {
    const userId = getAuthUserId(c);
    const bookId = c.req.param('id');
    const input = c.req.valid('json');
    const service = new BookService(c.env);

    try {
      const result = await service.recordBattle(userId, bookId, input);
      if (!result) {
        return c.json({ error: 'Book not found' }, 404);
      }
      return c.json(result, 201);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Book is not in reading status'
      ) {
        return c.json({ error: error.message }, 400);
      }
      throw error;
    }
  }
);

export default books;
