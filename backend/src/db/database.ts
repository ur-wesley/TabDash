import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const BUSY_TIMEOUT_MS = 5000,
  DEFAULT_DB_FILENAME = 'tabdash.sqlite',
  LEGACY_DB_SUFFIX = '.db',
  MEMORY_DB_PATH = ':memory:',
  SQLITE_FILE_SUFFIX = '.sqlite';

export const createDatabase = (dbPath?: string): Database => {
  const targetPath = dbPath ?? process.env.DB_PATH ?? './data/tabdash.sqlite';

  let db: Database;
  if (targetPath === MEMORY_DB_PATH) {
    db = new Database(MEMORY_DB_PATH);
  } else {
    let filePath = resolve(targetPath);
    if (!filePath.endsWith(SQLITE_FILE_SUFFIX) && !filePath.endsWith(LEGACY_DB_SUFFIX)) {
      filePath = resolve(filePath, DEFAULT_DB_FILENAME);
    }
    mkdirSync(dirname(filePath), { recursive: true });
    db = new Database(filePath);
  }

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = ${String(BUSY_TIMEOUT_MS)};
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
};
