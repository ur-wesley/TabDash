interface WindowRecord {
  count: number;
  resetAt: number;
}

const DEFAULT_MAX_REQUESTS = 100,
  DEFAULT_WINDOW_MS = 60_000,
  INITIAL_REQUEST_COUNT = 1;

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly clients = new Map<string, WindowRecord>();

  public constructor(maxRequests = DEFAULT_MAX_REQUESTS, windowMs = DEFAULT_WINDOW_MS) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public isAllowed(clientKey: string): boolean {
    const now = Date.now(),
      record = this.clients.get(clientKey);

    if (record === undefined || now >= record.resetAt) {
      this.clients.set(clientKey, {
        count: INITIAL_REQUEST_COUNT,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count += INITIAL_REQUEST_COUNT;
    return true;
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.clients.entries()) {
      if (now >= record.resetAt) {
        this.clients.delete(key);
      }
    }
  }

  public reset(): void {
    this.clients.clear();
  }
}
