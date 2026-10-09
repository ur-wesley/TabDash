export function sanitizeStorageKey(rawKey?: string | null): string | null {
  if (!rawKey) {
    return null;
  }
  const trimmed = rawKey.trim();
  if (!trimmed || trimmed.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function getStoragePartitionKey(sanitizedKey: string): string {
  return `db:settings:${sanitizedKey}.json`;
}
