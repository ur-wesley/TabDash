class Storage {
  private _storage: chrome.storage.LocalStorageArea | chrome.storage.SyncStorageArea;
  constructor(sync: boolean = false) {
    this._storage = sync ? chrome.storage.sync : chrome.storage.local;
  }

  public async get<T = Record<string, unknown>>(key: string): Promise<T | null> {
    try {
      return new Promise<T | null>((resolve) => {
        this._storage.get(key, (results) => {
          resolve((results as T) ?? null);
        });
      });
    } catch {
      return null;
    }
  }

  public set(object: object): void {
    this._storage.set(object);
  }

  public remove(key: string): void {
    this._storage.remove(key);
  }
}

class LocalStorage {
  private _storage: globalThis.Storage;
  constructor() {
    this._storage = window.localStorage;
  }

  public async get<T = Record<string, unknown>>(key: string): Promise<T | null> {
    try {
      const result = this._storage.getItem(key);
      if (result) {
        return JSON.parse(result) as T;
      }
      return null;
    } catch {
      return null;
    }
  }

  public set(object: object): void {
    Object.entries(object).forEach(([k, v]) => {
      this._storage.setItem(k, JSON.stringify({ [k]: v }));
    });
  }

  public remove(key: string): void {
    this._storage.removeItem(key);
  }
}

export { Storage, LocalStorage };
