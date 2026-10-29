import { describe, expect, it } from 'bun:test';
import { getStoragePartitionKey, sanitizeStorageKey } from './storageKey.js';

const MAX_KEY_LENGTH = 128,
  OVER_MAX_KEY_LENGTH = MAX_KEY_LENGTH + 1;

describe('Storage Key utility', () => {
  it('accepts valid alphanumeric keys with dashes and underscores', () => {
    expect(sanitizeStorageKey('user_123-pref')).toBe('user_123-pref');
    expect(sanitizeStorageKey('test3')).toBe('test3');
  });

  it('rejects path traversal and illegal characters', () => {
    expect(sanitizeStorageKey('../secret')).toBeNull();
    expect(sanitizeStorageKey('foo/bar')).toBeNull();
    expect(sanitizeStorageKey(String.raw`foo\bar`)).toBeNull();
    expect(sanitizeStorageKey('foo bar')).toBeNull();
    expect(sanitizeStorageKey('')).toBeNull();
    expect(sanitizeStorageKey(null)).toBeNull();
    expect(sanitizeStorageKey()).toBeNull();
  });

  it('rejects keys exceeding maximum length', () => {
    const longKey = 'a'.repeat(OVER_MAX_KEY_LENGTH);
    expect(sanitizeStorageKey(longKey)).toBeNull();
  });

  it('formats partition key correctly', () => {
    expect(getStoragePartitionKey('test3')).toBe('db:settings:test3.json');
  });
});
