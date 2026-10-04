import { describe, expect, it } from 'bun:test';
import { getStoragePartitionKey, sanitizeStorageKey } from './storageKey.js';

describe('Storage Key utility', () => {
  it('accepts valid alphanumeric keys with dashes and underscores', () => {
    expect(sanitizeStorageKey('user_123-pref')).toBe('user_123-pref');
    expect(sanitizeStorageKey('test3')).toBe('test3');
  });

  it('rejects path traversal and illegal characters', () => {
    expect(sanitizeStorageKey('../secret')).toBeNull();
    expect(sanitizeStorageKey('foo/bar')).toBeNull();
    expect(sanitizeStorageKey('foo\\bar')).toBeNull();
    expect(sanitizeStorageKey('foo bar')).toBeNull();
    expect(sanitizeStorageKey('')).toBeNull();
    expect(sanitizeStorageKey(null)).toBeNull();
    expect(sanitizeStorageKey(undefined)).toBeNull();
  });

  it('rejects keys exceeding maximum length', () => {
    const longKey = 'a'.repeat(129);
    expect(sanitizeStorageKey(longKey)).toBeNull();
  });

  it('formats partition key correctly', () => {
    expect(getStoragePartitionKey('test3')).toBe('db:settings:test3.json');
  });
});
