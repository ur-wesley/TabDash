import { describe, expect, it } from 'bun:test';
import { StorageService } from './storage-service';

describe('StorageService', () => {
  it('stores and retrieves items with ResultAsync', async () => {
    // In test environment, window.localStorage is available
    const service = new StorageService(false);
    const setResult = await service.set({ testKey: { greeting: 'hello' } });
    expect(setResult.isOk()).toBe(true);

    const getResult = await service.get<{ testKey: { greeting: string } }>('testKey');
    expect(getResult.isOk()).toBe(true);
    if (getResult.isOk()) {
      expect(getResult.value?.testKey.greeting).toBe('hello');
    }

    const removeResult = await service.remove('testKey');
    expect(removeResult.isOk()).toBe(true);

    const getAfterRemove = await service.get('testKey');
    expect(getAfterRemove.isOk()).toBe(true);
    if (getAfterRemove.isOk()) {
      expect(getAfterRemove.value).toBeNull();
    }
  });
});
