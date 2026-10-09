interface WindowRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly clients = new Map<string, WindowRecord>();

  constructor(maxRequests = 100, windowMs = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(clientKey: string): boolean {
    const now = Date.now(),
      record = this.clients.get(clientKey);

    if (!record || now >= record.resetAt) {
      this.clients.set(clientKey, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count += 1;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.clients.entries()) {
      if (now >= record.resetAt) {
        this.clients.delete(key);
      }
    }
  }

  reset(): void {
    this.clients.clear();
  }
}
