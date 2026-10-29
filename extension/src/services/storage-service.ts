import { ResultAsync } from '@ur-wesley/ts-prelude/result';
import { isPlainObject, isStorageRecord } from '../lib/type-guards';

const memoryStorage = new Map<string, string>(),
  parseJsonValue = (raw: string): unknown => JSON.parse(raw),
  extensionGlobal = (): { chrome?: typeof chrome; browser?: typeof chrome } =>
    globalThis as { chrome?: typeof chrome; browser?: typeof chrome };

type ExtensionStorageArea = chrome.storage.StorageArea;

export class StorageService {
  private readonly sync: boolean;

  public constructor(sync = false) {
    this.sync = sync;
  }

  private extensionStorageArea(): ExtensionStorageArea | null {
    const storage = extensionGlobal().chrome?.storage ?? extensionGlobal().browser?.storage;
    if (!storage) {
      return null;
    }
    return this.sync ? storage.sync : storage.local;
  }

  private isExtensionStorage(): boolean {
    return this.extensionStorageArea() !== null;
  }

  private isStoredValue(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      return true;
    }
    return isStorageRecord(value);
  }

  public get<T>(key: string): ResultAsync<T | null, Error> {
    return ResultAsync.fromPromise(
      new Promise<T | null>((resolve, reject) => {
        try {
          const area = this.extensionStorageArea();
          if (area !== null) {
            area.get(key, (items) => {
              const runtime =
                extensionGlobal().chrome?.runtime ?? extensionGlobal().browser?.runtime;
              if (runtime?.lastError) {
                reject(new Error(runtime.lastError.message));
                return;
              }
              const bag = isPlainObject(items) ? items : {},
                value = bag[key];
              if (value === undefined) {
                resolve(null);
                return;
              }
              if (this.isStoredValue(value)) {
                resolve(value as T);
                return;
              }
              reject(new Error('Stored value is not a valid payload'));
            });
            return;
          }
          if (globalThis.window !== undefined && globalThis.localStorage) {
            const raw = globalThis.localStorage.getItem(key);
            if (raw === null || raw === '') {
              resolve(null);
              return;
            }
            try {
              const parsed: unknown = parseJsonValue(raw);
              if (this.isStoredValue(parsed)) {
                resolve(parsed as T);
                return;
              }
              reject(new Error('Stored JSON is not a valid payload'));
            } catch (error) {
              reject(new Error(`Failed to parse localStorage JSON: ${String(error)}`));
            }
            return;
          }
          const raw = memoryStorage.get(key);
          if (raw === undefined || raw === '') {
            resolve(null);
            return;
          }
          try {
            const parsed: unknown = parseJsonValue(raw);
            if (this.isStoredValue(parsed)) {
              resolve(parsed as T);
              return;
            }
            reject(new Error('Stored JSON is not a valid payload'));
          } catch (error) {
            reject(new Error(`Failed to parse memory JSON: ${String(error)}`));
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
          const area = this.extensionStorageArea();
          if (area !== null) {
            area.set(items, () => {
              const runtime =
                extensionGlobal().chrome?.runtime ?? extensionGlobal().browser?.runtime;
              if (runtime?.lastError) {
                reject(new Error(runtime.lastError.message));
                return;
              }
              resolve();
            });
            return;
          }
          if (globalThis.window !== undefined && globalThis.localStorage) {
            for (const [entryKey, entryValue] of Object.entries(items)) {
              globalThis.localStorage.setItem(entryKey, JSON.stringify(entryValue));
            }
            resolve();
            return;
          }
          for (const [entryKey, entryValue] of Object.entries(items)) {
            memoryStorage.set(entryKey, JSON.stringify(entryValue));
          }
          resolve();
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
          const area = this.extensionStorageArea();
          if (area !== null) {
            area.remove(key, () => {
              const runtime =
                extensionGlobal().chrome?.runtime ?? extensionGlobal().browser?.runtime;
              if (runtime?.lastError) {
                reject(new Error(runtime.lastError.message));
                return;
              }
              resolve();
            });
            return;
          }
          if (globalThis.window !== undefined && globalThis.localStorage) {
            globalThis.localStorage.removeItem(key);
            resolve();
            return;
          }
          memoryStorage.delete(key);
          resolve();
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
          const area = this.extensionStorageArea();
          if (area !== null) {
            area.clear(() => {
              const runtime =
                extensionGlobal().chrome?.runtime ?? extensionGlobal().browser?.runtime;
              if (runtime?.lastError) {
                reject(new Error(runtime.lastError.message));
                return;
              }
              resolve();
            });
            return;
          }
          if (globalThis.window !== undefined && globalThis.localStorage) {
            globalThis.localStorage.clear();
            resolve();
            return;
          }
          memoryStorage.clear();
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }),
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }
}

export const storageService = new StorageService(false);
