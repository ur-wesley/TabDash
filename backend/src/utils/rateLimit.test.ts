import { describe, expect, it } from 'bun:test';
import { RateLimiter } from './rateLimit.js';

describe('RateLimiter', () => {
  it('allows requests within limit and blocks when exceeded', () => {
    const limiter = new RateLimiter(3, 1000);

    expect(limiter.isAllowed('ip-1')).toBe(true);
    expect(limiter.isAllowed('ip-1')).toBe(true);
    expect(limiter.isAllowed('ip-1')).toBe(true);
    expect(limiter.isAllowed('ip-1')).toBe(false);

    // Other client is still allowed
    expect(limiter.isAllowed('ip-2')).toBe(true);
  });

  it('resets correctly after cleanup or explicit reset', () => {
    const limiter = new RateLimiter(1, 1000);

    expect(limiter.isAllowed('ip-1')).toBe(true);
    expect(limiter.isAllowed('ip-1')).toBe(false);

    limiter.reset();
    expect(limiter.isAllowed('ip-1')).toBe(true);
  });
});
