import { ResultAsync } from '@ur-wesley/ts-prelude/result';
import type { Setting } from '../../types/settings';

export class SyncService {
  private companionBase: string;

  constructor(companionBase?: string) {
    this.companionBase =
      companionBase ?? import.meta.env?.VITE_COMPANION_BASE ?? 'https://tabdash.app';
  }

  public readClipboard(): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(navigator.clipboard.readText(), (e) =>
      e instanceof Error ? e : new Error(String(e)),
    );
  }

  public writeClipboard(text: string): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(navigator.clipboard.writeText(text), (e) =>
      e instanceof Error ? e : new Error(String(e)),
    );
  }

  public fetchFromCloud(key: string, password?: string): ResultAsync<Setting, Error> {
    const pwQuery = password ? `?p=${encodeURIComponent(password)}` : '';
    const url = `${this.companionBase}/api/setting/${encodeURIComponent(key)}${pwQuery}`;

    return ResultAsync.fromPromise(
      fetch(url).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Cloud fetch failed: ${res.status} ${res.statusText}`);
        }
        return (await res.json()) as Setting;
      }),
      (e) => (e instanceof Error ? e : new Error(String(e))),
    );
  }

  public saveToCloud(key: string, settings: Setting, password?: string): ResultAsync<void, Error> {
    const pwQuery = password ? `?p=${encodeURIComponent(password)}` : '';
    const url = `${this.companionBase}/api/setting/${encodeURIComponent(key)}${pwQuery}`;

    return ResultAsync.fromPromise(
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Cloud save failed: ${res.status} ${res.statusText}`);
        }
      }),
      (e) => (e instanceof Error ? e : new Error(String(e))),
    );
  }
}

export const syncService = new SyncService();
