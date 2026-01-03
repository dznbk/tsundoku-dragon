import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../lib/dynamodb';
import { BookService } from '../services/bookService';
import { createBookSchema } from '../types/api';

const books = new Hono<{ Bindings: Env }>();

const getUserId = (c: {
  req: { header: (name: string) => string | undefined };
}): string => {
  return c.req.header('X-User-Id') ?? 'dev-user-001';
};

books.post('/', zValidator('json', createBookSchema), async (c) => {
  const input = c.req.valid('json');
  const userId = getUserId(c);
  const service = new BookService(c.env);
  const book = await service.createBook(userId, input);
  return c.json(book, 201);
});

books.get('/', async (c) => {
  const userId = getUserId(c);
  const service = new BookService(c.env);
  const bookList = await service.listBooks(userId);
  return c.json({ books: bookList });
});

books.get('/:id', async (c) => {
  const userId = getUserId(c);
  const bookId = c.req.param('id');
  const service = new BookService(c.env);
  const book = await service.getBook(userId, bookId);
  if (!book) {
    return c.json({ error: 'Book not found' }, 404);
  }
  return c.json(book);
});

export default books;
