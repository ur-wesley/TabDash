import { describe, expect, it } from 'bun:test';
import { RateLimiter } from './rateLimit.js';

const ONE_REQUEST = 1,
  THREE_REQUESTS = 3,
  WINDOW_MS = 1000;

describe('RateLimiter', () => {
  it('allows requests within limit and blocks when exceeded', () => {
    const limiter = new RateLimiter(THREE_REQUESTS, WINDOW_MS);

    expect(limiter.isAllowed('ip-1')).toBe(true);
    expect(limiter.isAllowed('ip-1')).toBe(true);
    expect(limiter.isAllowed('ip-1')).toBe(true);
    expect(limiter.isAllowed('ip-1')).toBe(false);

    expect(limiter.isAllowed('ip-2')).toBe(true);
  });

  it('resets correctly after cleanup or explicit reset', () => {
    const limiter = new RateLimiter(ONE_REQUEST, WINDOW_MS);

    expect(limiter.isAllowed('ip-1')).toBe(true);
    expect(limiter.isAllowed('ip-1')).toBe(false);

    limiter.reset();
    expect(limiter.isAllowed('ip-1')).toBe(true);
  });
});
