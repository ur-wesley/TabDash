import { describe, expect, it } from 'bun:test';
import Crypto from './crypto.js';

describe('Crypto utility', () => {
  it('encrypts and decrypts clear text successfully', () => {
    const secret = 'test-secret-value',
      password = 'super-safe-password',
      encrypted = Crypto.encrypt(secret, password);
    expect(encrypted).not.toBe(secret);

    const decrypted = Crypto.decrypt(encrypted, password);
    expect(decrypted).toBe(secret);
  });

  it('fails gracefully with invalid password', () => {
    const secret = 'another-secret',
      password = 'correct-password',
      encrypted = Crypto.encrypt(secret, password),
      decrypted = Crypto.decrypt(encrypted, 'wrong-password');
    expect(decrypted).toBeFalsy();
  });
});
