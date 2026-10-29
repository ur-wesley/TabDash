const MAX_STORAGE_KEY_LENGTH = 128,
  STORAGE_KEY_PATTERN = /^[a-zA-Z0-9_-]+$/u;

export const sanitizeStorageKey = (rawKey?: string | null): string | null => {
  if (rawKey === null || rawKey === undefined || rawKey === '') {
    return null;
  }
  const trimmed = rawKey.trim();
  if (
    trimmed === '' ||
    trimmed.length > MAX_STORAGE_KEY_LENGTH ||
    !STORAGE_KEY_PATTERN.test(trimmed)
  ) {
    return null;
  }
  return trimmed;
};

export const getStoragePartitionKey = (sanitizedKey: string): string =>
  `db:settings:${sanitizedKey}.json`;
