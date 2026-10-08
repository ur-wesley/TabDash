import { createDatabase } from './db/database.js';
import { createApp } from './server.js';

const port = Number(process.env.PORT || 3005);
const hostname = process.env.HOST || '0.0.0.0';

const db = createDatabase();
const app = createApp(db);

const server = Bun.serve({
  port,
  hostname,
  maxRequestBodySize: 1024 * 512, // 512KB
  fetch: app.fetch,
});

// Clean, informative startup message
// eslint-disable-next-line no-console
console.log(`[TabDash Backend] Serving at http://${hostname}:${port}`);

let isShuttingDown = false;
const shutdown = () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  // eslint-disable-next-line no-console
  console.log('[TabDash Backend] Closing server and database...');
  void server.stop(true);
  db.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
