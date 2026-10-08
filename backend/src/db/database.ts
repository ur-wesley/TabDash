import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function createDatabase(dbPath?: string): Database {
  const targetPath = dbPath ?? process.env.DB_PATH ?? './data/tabdash.sqlite';

  let db: Database;
  if (targetPath === ':memory:') {
    db = new Database(':memory:');
  } else {
    // If targetPath points to a directory, append tabdash.sqlite
    let filePath = resolve(targetPath);
    if (!filePath.endsWith('.sqlite') && !filePath.endsWith('.db')) {
      filePath = resolve(filePath, 'tabdash.sqlite');
    }
    mkdirSync(dirname(filePath), { recursive: true });
    db = new Database(filePath);
  }

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    PRAGMA auto_vacuum = INCREMENTAL;

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS installations (
      id TEXT PRIMARY KEY,
      browser TEXT NOT NULL,
      installed_at INTEGER NOT NULL,
      deinstalled_at INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_installations_browser ON installations(browser);
  `);

  return db;
}
