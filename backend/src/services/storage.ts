import type { Database, Statement } from 'bun:sqlite';
import { Browser } from '../types/stats.js';
import type { AvailableBrowser, StatisticResponse } from '../types/stats.js';

const ZERO_COUNT = 0;

export const normalizeBrowser = (raw: string | null | undefined): AvailableBrowser | null => {
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }
  const lower = raw.trim().toLowerCase();
  for (const browserName of Browser) {
    if (browserName.toLowerCase() === lower) {
      return browserName;
    }
  }
  return null;
};

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

  public constructor(db: Database) {
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

  public getSetting(key: string): string | null {
    const row = this.getSettingStmt.get(key);
    if (row === null || row === undefined) {
      return null;
    }
    return row.data;
  }

  public saveSetting(key: string, data: string): { created: boolean } {
    const exists = this.hasSettingStmt.get(key) !== null,
      now = Date.now();
    this.upsertSettingStmt.run(key, data, now, now);
    return { created: !exists };
  }

  public recordInstall(id: string, rawBrowser: string): boolean {
    const browser = normalizeBrowser(rawBrowser);
    if (browser === null || id.trim() === '') {
      return false;
    }

    try {
      this.insertInstallStmt.run(id.trim(), browser, Date.now());
      return true;
    } catch {
      return false;
    }
  }

  public recordDeinstall(id: string, rawBrowser: string): boolean {
    const browser = normalizeBrowser(rawBrowser);
    if (browser === null || id.trim() === '') {
      return false;
    }

    const result = this.updateDeinstallStmt.run(Date.now(), id.trim(), browser);
    return result.changes > ZERO_COUNT;
  }

  public getStatistics(): StatisticResponse {
    const initialStats: StatisticResponse = {
        Chrome: { deinstalls: ZERO_COUNT, installs: ZERO_COUNT },
        Edge: { deinstalls: ZERO_COUNT, installs: ZERO_COUNT },
        Firefox: { deinstalls: ZERO_COUNT, installs: ZERO_COUNT },
        Safari: { deinstalls: ZERO_COUNT, installs: ZERO_COUNT },
      },
      rows = this.getStatsStmt.all();
    for (const row of rows) {
      const browserKey = normalizeBrowser(row.browser);
      if (browserKey !== null && initialStats[browserKey] !== undefined) {
        initialStats[browserKey] = {
          deinstalls: row.deinstalls,
          installs: row.installs,
        };
      }
    }

    return initialStats;
  }
}
