import { createDatabase } from './db/database.js';
import { createApp } from './server.js';

const DEFAULT_HOST = '0.0.0.0',
  DEFAULT_PORT = 3005,
  KILOBYTE = 1024,
  MAX_REQUEST_BODY_KB = 512,
  port = Number(process.env.PORT ?? DEFAULT_PORT),
  hostname = process.env.HOST ?? DEFAULT_HOST,
  db = createDatabase(),
  app = createApp(db),
  server = Bun.serve({
    fetch: app.fetch,
    hostname,
    maxRequestBodySize: KILOBYTE * MAX_REQUEST_BODY_KB,
    port,
  });

// eslint-disable-next-line no-console
console.log(`[TabDash Backend] Serving at http://${hostname}:${port}`);

let isShuttingDown = false;
const shutdown = (): void => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  // eslint-disable-next-line no-console
  console.log('[TabDash Backend] Closing server and database...');
  void server.stop(true);
  db.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
