import { describe, expect, it } from 'bun:test';
import { createDatabase } from '../db/database.js';
import { normalizeBrowser, StorageService } from './storage.js';

describe('StorageService', () => {
  it('normalizes browser case correctly', () => {
    expect(normalizeBrowser('chrome')).toBe('Chrome');
    expect(normalizeBrowser('FIREFOX')).toBe('Firefox');
    expect(normalizeBrowser('Edge')).toBe('Edge');
    expect(normalizeBrowser('safari')).toBe('Safari');
    expect(normalizeBrowser('opera')).toBeNull();
    expect(normalizeBrowser(null)).toBeNull();
  });

  it('handles settings lifecycle with created and patched states', () => {
    const db = createDatabase(':memory:');
    const storage = new StorageService(db);

    expect(storage.getSetting('nonexistent')).toBeNull();

    const createResult = storage.saveSetting('user-1', 'encrypted-payload-1');
    expect(createResult.created).toBe(true);
    expect(storage.getSetting('user-1')).toBe('encrypted-payload-1');

    const patchResult = storage.saveSetting('user-1', 'encrypted-payload-updated');
    expect(patchResult.created).toBe(false);
    expect(storage.getSetting('user-1')).toBe('encrypted-payload-updated');

    db.close();
  });

  it('tracks installations and prevents duplicate installs with same ID', () => {
    const db = createDatabase(':memory:');
    const storage = new StorageService(db);

    const first = storage.recordInstall('inst-123', 'Chrome');
    expect(first).toBe(true);

    // Duplicate install must be rejected
    const duplicate = storage.recordInstall('inst-123', 'Chrome');
    expect(duplicate).toBe(false);

    // Invalid browser must be rejected
    const invalid = storage.recordInstall('inst-456', 'UnknownBrowser');
    expect(invalid).toBe(false);

    db.close();
  });

  it('tracks deinstallations accurately', () => {
    const db = createDatabase(':memory:');
    const storage = new StorageService(db);

    storage.recordInstall('inst-1', 'Firefox');

    // Deinstall valid existing
    const deinstall = storage.recordDeinstall('inst-1', 'Firefox');
    expect(deinstall).toBe(true);

    // Second deinstall must fail (already deinstalled)
    const secondDeinstall = storage.recordDeinstall('inst-1', 'Firefox');
    expect(secondDeinstall).toBe(false);

    // Deinstall non-existing ID must fail
    const nonExisting = storage.recordDeinstall('inst-does-not-exist', 'Firefox');
    expect(nonExisting).toBe(false);

    db.close();
  });

  it('aggregates statistics across all supported browsers', () => {
    const db = createDatabase(':memory:');
    const storage = new StorageService(db);

    const initial = storage.getStatistics();
    expect(initial.Chrome).toEqual({ installs: 0, deinstalls: 0 });
    expect(initial.Firefox).toEqual({ installs: 0, deinstalls: 0 });
    expect(initial.Edge).toEqual({ installs: 0, deinstalls: 0 });
    expect(initial.Safari).toEqual({ installs: 0, deinstalls: 0 });

    storage.recordInstall('c1', 'chrome');
    storage.recordInstall('c2', 'Chrome');
    storage.recordInstall('f1', 'firefox');
    storage.recordDeinstall('c1', 'chrome');

    const stats = storage.getStatistics();
    expect(stats.Chrome).toEqual({ installs: 2, deinstalls: 1 });
    expect(stats.Firefox).toEqual({ installs: 1, deinstalls: 0 });
    expect(stats.Edge).toEqual({ installs: 0, deinstalls: 0 });

    db.close();
  });
});
