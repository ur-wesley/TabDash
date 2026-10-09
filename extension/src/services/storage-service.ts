import { ResultAsync } from '@ur-wesley/ts-prelude/result';

// In-memory store fallback for test and non-browser environments
const memoryStorage = new Map<string, string>();

export class StorageService {
  private readonly sync: boolean;

  constructor(sync: boolean = false) {
    this.sync = sync;
  }

  private isChromeStorage(): boolean {
    return (
      typeof chrome !== 'undefined' &&
      chrome.storage !== undefined &&
      (import.meta.env?.VITE_IS_EXTENSION === 'true' || Boolean(chrome.storage.local))
    );
  }

  public get<T = Record<string, unknown>>(key: string): ResultAsync<T | null, Error> {
    return ResultAsync.fromPromise(
      new Promise<T | null>((resolve, reject) => {
        try {
          if (this.isChromeStorage()) {
            const area = this.sync ? chrome.storage.sync : chrome.storage.local;
            area.get(key, (items) => {
              if (chrome.runtime?.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              resolve((items as T) ?? null);
            });
          } else if (typeof window !== 'undefined' && window.localStorage) {
            const raw = window.localStorage.getItem(key);
            if (!raw) {
              resolve(null);
              return;
            }
            try {
              resolve(JSON.parse(raw) as T);
            } catch (error) {
              reject(new Error(`Failed to parse localStorage JSON: ${String(error)}`));
            }
          } else {
            const raw = memoryStorage.get(key);
            if (!raw) {
              resolve(null);
              return;
            }
            try {
              resolve(JSON.parse(raw) as T);
            } catch (error) {
              reject(new Error(`Failed to parse memory JSON: ${String(error)}`));
            }
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }),
      (e) => (e instanceof Error ? e : new Error(String(e))),
    );
  }

  public set(items: Record<string, unknown>): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      new Promise<void>((resolve, reject) => {
        try {
          if (this.isChromeStorage()) {
            const area = this.sync ? chrome.storage.sync : chrome.storage.local;
            area.set(items, () => {
              if (chrome.runtime?.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              resolve();
            });
          } else if (typeof window !== 'undefined' && window.localStorage) {
            for (const [k, v] of Object.entries(items)) {
              window.localStorage.setItem(k, JSON.stringify({ [k]: v }));
            }
            resolve();
          } else {
            for (const [k, v] of Object.entries(items)) {
              memoryStorage.set(k, JSON.stringify({ [k]: v }));
            }
            resolve();
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }),
      (e) => (e instanceof Error ? e : new Error(String(e))),
    );
  }

  public remove(key: string): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      new Promise<void>((resolve, reject) => {
        try {
          if (this.isChromeStorage()) {
            const area = this.sync ? chrome.storage.sync : chrome.storage.local;
            area.remove(key, () => {
              if (chrome.runtime?.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              resolve();
            });
          } else if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
            resolve();
          } else {
            memoryStorage.delete(key);
            resolve();
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }),
      (e) => (e instanceof Error ? e : new Error(String(e))),
    );
  }

  public clear(): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      new Promise<void>((resolve, reject) => {
        try {
          if (this.isChromeStorage()) {
            const area = this.sync ? chrome.storage.sync : chrome.storage.local;
            area.clear(() => {
              if (chrome.runtime?.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              resolve();
            });
          } else if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.clear();
            resolve();
          } else {
            memoryStorage.clear();
            resolve();
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }),
      (e) => (e instanceof Error ? e : new Error(String(e))),
    );
  }
}

export const storageService = new StorageService(false);
