import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types/env';
import { getAuthUserId } from '../middleware/auth';
import { BookService } from '../services/bookService';
import { createBookSchema, updateBookSchema } from '../types/api';

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
  const book = await service.updateBook(userId, bookId, input);
  if (!book) {
    return c.json({ error: 'Book not found' }, 404);
  }
  return c.json(book);
});

books.delete('/:id', async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const service = new BookService(c.env);
  const deleted = await service.deleteBook(userId, bookId);
  if (!deleted) {
    return c.json({ error: 'Book not found' }, 404);
  }
  return c.json({ success: true });
});

books.post('/:id/reset', async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const service = new BookService(c.env);
  const book = await service.resetBook(userId, bookId);
  if (!book) {
    return c.json({ error: 'Book not found or not completed' }, 404);
  }
  return c.json(book);
});

books.get('/:id/logs', async (c) => {
  const userId = getAuthUserId(c);
  const bookId = c.req.param('id');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const service = new BookService(c.env);
  const result = await service.getBattleLogs(userId, bookId, page, limit);
  if (!result) {
    return c.json({ error: 'Book not found' }, 404);
  }
  return c.json(result);
});

export default books;
