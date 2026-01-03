import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { Hono } from 'hono';

import { createDynamoDBClient, type Env } from './lib/dynamodb';
import books from './routes/books';

const app = new Hono<{ Bindings: Env }>();

app.route('/books', books);

app.get('/', (c) => {
  return c.json({ message: 'Tsundoku Dragon API' });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.get('/db/health', async (c) => {
  try {
    const client = createDynamoDBClient(c.env);
    const result = await client.send(
      new DescribeTableCommand({ TableName: c.env.DYNAMODB_TABLE_NAME })
    );
    return c.json({
      status: 'ok',
      table: c.env.DYNAMODB_TABLE_NAME,
      tableStatus: result.Table?.TableStatus,
    });
  } catch (error) {
    return c.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default app;
