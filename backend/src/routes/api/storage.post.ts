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

    const value = await readRawBody(event);
    if (!key || !password || !value) {
      setResponseStatus(event, 400);
      return { status: 400, body: 'missing key, encryption password, or body' };
    }

    const safeKey = sanitizeStorageKey(key);
    if (!safeKey) {
      setResponseStatus(event, 400);
      return { status: 400, body: 'invalid key format' };
    }

    const partitionKey = getStoragePartitionKey(safeKey);
    const encrypted = crypto.encrypt(value, password);
    const setting: Setting = { [safeKey]: encrypted };

    const exists = await useStorage().hasItem(partitionKey);
    await useStorage().setItem(partitionKey, setting);

    const status = exists ? 200 : 201;
    setResponseStatus(event, status);
    return { status, body: exists ? 'patched' : 'created' };
  } catch (error) {
    console.error(error);
    setResponseStatus(event, 500);
    return { status: 500, body: 'could not create setting entry' };
  }
});
