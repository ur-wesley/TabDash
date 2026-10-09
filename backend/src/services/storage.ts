import type { Database, Statement } from 'bun:sqlite';
import { Browser } from '../types/stats.js';
import type { AvailableBrowser, StatisticResponse } from '../types/stats.js';

export function normalizeBrowser(raw: string | null | undefined): AvailableBrowser | null {
  if (!raw) {
    return null;
  }
  const lower = raw.trim().toLowerCase();
  for (const b of Browser) {
    if (b.toLowerCase() === lower) {
      return b;
    }
  }
  return null;
}

export class StorageService {
  private readonly db: Database;
  private readonly getSettingStmt: Statement<{ data: string }, [string]>;
  private readonly hasSettingStmt: Statement<{ 1: number }, [string]>;
  private readonly upsertSettingStmt: Statement<void, [string, string, number, number]>;
  private readonly insertInstallStmt: Statement<void, [string, string, number]>;
  private readonly updateDeinstallStmt: Statement<void, [number, string, string]>;
  private readonly getStatsStmt: Statement<
    { browser: string; installs: number; deinstalls: number },
    []
  >;

  constructor(db: Database) {
    this.db = db;
    this.getSettingStmt = this.db.prepare('SELECT data FROM settings WHERE key = ?');
    this.hasSettingStmt = this.db.prepare('SELECT 1 FROM settings WHERE key = ?');
    this.upsertSettingStmt = this.db.prepare(`
      INSERT INTO settings (key, data, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        data = excluded.data,
        updated_at = excluded.updated_at
    `);
    this.insertInstallStmt = this.db.prepare(
      'INSERT INTO installations (id, browser, installed_at) VALUES (?, ?, ?)',
    );
    this.updateDeinstallStmt = this.db.prepare(`
      UPDATE installations
      SET deinstalled_at = ?
      WHERE id = ? AND browser = ? AND deinstalled_at IS NULL
    `);
    this.getStatsStmt = this.db.prepare(`
      SELECT browser, COUNT(*) as installs, COUNT(deinstalled_at) as deinstalls
      FROM installations
      GROUP BY browser
    `);
  }

  getSetting(key: string): string | null {
    const row = this.getSettingStmt.get(key);
    return row ? row.data : null;
  }

  saveSetting(key: string, data: string): { created: boolean } {
    const exists = this.hasSettingStmt.get(key) !== null,
      now = Date.now();
    this.upsertSettingStmt.run(key, data, now, now);
    return { created: !exists };
  }

  recordInstall(id: string, rawBrowser: string): boolean {
    const browser = normalizeBrowser(rawBrowser);
    if (!browser || !id.trim()) {
      return false;
    }

    try {
      this.insertInstallStmt.run(id.trim(), browser, Date.now());
      return true;
    } catch {
      // Primary key constraint violation (already installed) or invalid
      return false;
    }
  }

  recordDeinstall(id: string, rawBrowser: string): boolean {
    const browser = normalizeBrowser(rawBrowser);
    if (!browser || !id.trim()) {
      return false;
    }

    const result = this.updateDeinstallStmt.run(Date.now(), id.trim(), browser);
    return result.changes > 0;
  }

  getStatistics(): StatisticResponse {
    const initialStats: StatisticResponse = {
        Chrome: { deinstalls: 0, installs: 0 },
        Edge: { deinstalls: 0, installs: 0 },
        Firefox: { deinstalls: 0, installs: 0 },
        Safari: { deinstalls: 0, installs: 0 },
      },
      rows = this.getStatsStmt.all();
    for (const row of rows) {
      const b = normalizeBrowser(row.browser);
      if (b && initialStats[b]) {
        initialStats[b] = {
          deinstalls: row.deinstalls,
          installs: row.installs,
        };
      }
    }

    return initialStats;
  }
}
