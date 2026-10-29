import { describe, expect, it } from 'bun:test';
import Crypto from './crypto.js';

describe('Crypto utility', () => {
  it('encrypts and decrypts clear text successfully', () => {
    const password = 'super-safe-password',
      secret = 'test-secret-value',
      encrypted = Crypto.encrypt(secret, password);
    expect(encrypted).not.toBe(secret);

    const decrypted = Crypto.decrypt(encrypted, password);
    expect(decrypted).toBe(secret);
  });

  it('fails gracefully with invalid password', () => {
    const password = 'correct-password',
      secret = 'another-secret',
      encrypted = Crypto.encrypt(secret, password),
      decrypted = Crypto.decrypt(encrypted, 'wrong-password');
    expect(decrypted).toBeFalsy();
  });
});
