import { createDatabase } from './db/database.js';
import { createApp } from './server.js';

const port = Number(process.env.PORT || 3005),
  hostname = process.env.HOST || '0.0.0.0',
  db = createDatabase(),
  app = createApp(db),
  server = Bun.serve({
    fetch: app.fetch,
    hostname,
    maxRequestBodySize: 1024 * 512, // 512KB
    port,
  });

// Clean, informative startup message
// eslint-disable-next-line no-console
console.log(`[TabDash Backend] Serving at http://${hostname}:${port}`);

let isShuttingDown = false;
const shutdown = () => {
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
