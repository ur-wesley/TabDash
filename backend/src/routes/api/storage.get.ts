import { type Setting } from '../../types/setting.js';
import crypto from '../../utils/crypto.js';
import { getStoragePartitionKey, sanitizeStorageKey } from '../../utils/storageKey.js';

export default eventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const key = query.key as string;
    const password = (getHeader(event, 'x-storage-key') ||
      getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '') ||
      query.p) as string;

    if (!key || !password) {
      setResponseStatus(event, 400);
      return { status: 400, body: 'missing key or encryption password' };
    }

    const safeKey = sanitizeStorageKey(key);
    if (!safeKey) {
      setResponseStatus(event, 400);
      return { status: 400, body: 'invalid key format' };
    }

    const partitionKey = getStoragePartitionKey(safeKey);
    let encryptedData: string | undefined;

    // Check partitioned storage first
    const partitionedItem = await useStorage().getItem<Setting>(partitionKey);
    if (partitionedItem && partitionedItem[safeKey]) {
      encryptedData = partitionedItem[safeKey];
    } else {
      // Fallback to legacy db:settings.json
      const legacySettings: Setting[] | null = await useStorage().getItem('db:settings.json');
      const legacySetting = legacySettings?.find((s) => Object.keys(s)[0] === safeKey);
      if (legacySetting) {
        encryptedData = Object.values(legacySetting)[0];
      }
    }

    if (!encryptedData) {
      setResponseStatus(event, 404);
      return { status: 404, body: 'not found' };
    }

    const decrypted = crypto.decrypt(encryptedData, password);
    if (decrypted === null) {
      setResponseStatus(event, 401);
      return { status: 401, body: 'invalid decryption key' };
    }

    setHeader(event, 'Content-Type', 'application/json');
    setResponseStatus(event, 200);
    return decrypted;
  } catch (error) {
    console.error(error);
    setResponseStatus(event, 500);
    return { status: 500, body: 'could not get storage entry' };
  }
});
