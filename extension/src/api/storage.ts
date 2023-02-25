class Storage {
  private _storage:
    | chrome.storage.LocalStorageArea
    | chrome.storage.SyncStorageArea;
  constructor(sync: boolean = false) {
    this._storage = sync ? chrome.storage.sync : chrome.storage.local;
  }

  public async get(key: string): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        this._storage.get(key, (results) => {
          resolve(results);
        });
      });
    } catch (error) {
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
  private _storage;
  constructor() {
    this._storage = window.localStorage;
  }

  public async get(key: string): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        const result = this._storage.getItem(key);
        if (result) resolve(JSON.parse(result));
        else resolve("");
      });
    } catch (error) {
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
