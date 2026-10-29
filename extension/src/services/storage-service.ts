import { ResultAsync } from '@ur-wesley/ts-prelude/result';
import { isPlainObject, isStorageRecord } from '../lib/type-guards';

const memoryStorage = new Map<string, string>(),
  parseJsonValue = (raw: string): unknown => JSON.parse(raw);

export class StorageService {
  private readonly sync: boolean;

  public constructor(sync = false) {
    this.sync = sync;
  }

  private isChromeStorage(): boolean {
    return (
      typeof chrome !== 'undefined' &&
      chrome.storage !== undefined &&
      (import.meta.env.VITE_IS_EXTENSION === 'true' || Boolean(chrome.storage.local))
    );
  }

  public get<T extends Record<string, unknown> = Record<string, unknown>>(
    key: string,
  ): ResultAsync<T | null, Error> {
    return ResultAsync.fromPromise(
      new Promise<T | null>((resolve, reject) => {
        try {
          if (this.isChromeStorage()) {
            const area = this.sync ? chrome.storage.sync : chrome.storage.local;
            area.get(key, (items) => {
              if (chrome.runtime !== undefined && chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              const bag = isPlainObject(items) ? items : {},
                value = bag[key];
              if (value === undefined) {
                resolve(null);
                return;
              }
              if (isStorageRecord(value)) {
                resolve(value as T);
                return;
              }
              reject(new Error('Stored value is not a valid object payload'));
            });
          } else if (globalThis.window !== undefined && globalThis.localStorage) {
            const raw = globalThis.localStorage.getItem(key);
            if (raw === null || raw === '') {
              resolve(null);
              return;
            }
            try {
              const parsed: unknown = parseJsonValue(raw);
              if (isStorageRecord(parsed)) {
                resolve(parsed as T);
                return;
              }
              reject(new Error('Stored JSON is not a valid object payload'));
            } catch (error) {
              reject(new Error(`Failed to parse localStorage JSON: ${String(error)}`));
            }
          } else {
            const raw = memoryStorage.get(key);
            if (raw === undefined || raw === '') {
              resolve(null);
              return;
            }
            try {
              const parsed: unknown = parseJsonValue(raw);
              if (isStorageRecord(parsed)) {
                resolve(parsed as T);
                return;
              }
              reject(new Error('Stored JSON is not a valid object payload'));
            } catch (error) {
              reject(new Error(`Failed to parse memory JSON: ${String(error)}`));
            }
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }

  public set(items: Record<string, unknown>): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      new Promise<void>((resolve, reject) => {
        try {
          if (this.isChromeStorage()) {
            const area = this.sync ? chrome.storage.sync : chrome.storage.local;
            area.set(items, () => {
              if (chrome.runtime !== undefined && chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              resolve();
            });
          } else if (globalThis.window !== undefined && globalThis.localStorage) {
            for (const [entryKey, entryValue] of Object.entries(items)) {
              globalThis.localStorage.setItem(entryKey, JSON.stringify({ [entryKey]: entryValue }));
            }
            resolve();
          } else {
            for (const [entryKey, entryValue] of Object.entries(items)) {
              memoryStorage.set(entryKey, JSON.stringify({ [entryKey]: entryValue }));
            }
            resolve();
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }

  public remove(key: string): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      new Promise<void>((resolve, reject) => {
        try {
          if (this.isChromeStorage()) {
            const area = this.sync ? chrome.storage.sync : chrome.storage.local;
            area.remove(key, () => {
              if (chrome.runtime !== undefined && chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              resolve();
            });
          } else if (globalThis.window !== undefined && globalThis.localStorage) {
            globalThis.localStorage.removeItem(key);
            resolve();
          } else {
            memoryStorage.delete(key);
            resolve();
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }

  public clear(): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      new Promise<void>((resolve, reject) => {
        try {
          if (this.isChromeStorage()) {
            const area = this.sync ? chrome.storage.sync : chrome.storage.local;
            area.clear(() => {
              if (chrome.runtime !== undefined && chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              resolve();
            });
          } else if (globalThis.window !== undefined && globalThis.localStorage) {
            globalThis.localStorage.clear();
            resolve();
          } else {
            memoryStorage.clear();
            resolve();
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }
}

export const storageService = new StorageService(false);
