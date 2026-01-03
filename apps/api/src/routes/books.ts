import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../types/env';
import { getAuthUserId } from '../middleware/auth';
import { BookService } from '../services/bookService';
import { createBookSchema } from '../types/api';

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

export default books;
