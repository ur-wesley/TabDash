import type { Database } from 'bun:sqlite';
import pkg from '../package.json';
import { StorageService } from './services/storage.js';
import Crypto from './utils/crypto.js';
import { RateLimiter } from './utils/rateLimit.js';
import { sanitizeStorageKey } from './utils/storageKey.js';

export interface AppInstance {
  fetch: (req: Request) => Promise<Response>;
  storage: StorageService;
  rateLimiter: RateLimiter;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Storage-Key',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function rawJson(rawPayload: string, status = 200): Response {
  return new Response(rawPayload, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export function createApp(db: Database): AppInstance {
  const storage = new StorageService(db);
  const rateLimiter = new RateLimiter(120, 60_000);

  const fetchHandler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const { pathname } = url;
    const method = req.method.toUpperCase();

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // Healthcheck
    if (pathname === '/health' || pathname === '/') {
      return json({
        status: 'ok',
        uptime: process.uptime(),
        version: pkg.version,
        db: 'connected',
      });
    }

    // Extract client IP for rate limiting
    const clientIp =
      req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown-client';

    // Route: GET /api/statistic
    if (method === 'GET' && pathname === '/api/statistic') {
      try {
        const stats = storage.getStatistics();
        return json(stats, 200);
      } catch {
        return json({ status: 400, body: 'could not get statistic entries' }, 400);
      }
    }

    // Route: GET /api/install
    if (method === 'GET' && pathname === '/api/install') {
      const id = url.searchParams.get('id');
      const browser = url.searchParams.get('browser');
      if (!id || !browser) {
        return json({ status: 400, body: 'could not create statistic entry' }, 400);
      }

      const success = storage.recordInstall(id, browser);
      if (!success) {
        return json({ status: 400, body: 'could not create statistic entry' }, 400);
      }

      return json({ status: 201, body: 'created' }, 201);
    }

    // Route: GET /api/deinstall
    if (method === 'GET' && pathname === '/api/deinstall') {
      const id = url.searchParams.get('id');
      const browser = url.searchParams.get('browser');
      if (!id || !browser) {
        return json({ status: 400, body: 'could not update statistic entry' }, 400);
      }

      const success = storage.recordDeinstall(id, browser);
      if (!success) {
        return json({ status: 400, body: 'could not update statistic entry' }, 400);
      }

      return json({ status: 200, body: 'updated' }, 200);
    }

    // Storage Routes: /api/storage or /api/setting/:key
    const isStorageRoute = pathname === '/api/storage' || pathname.startsWith('/api/setting/');

    if (isStorageRoute) {
      if (!rateLimiter.isAllowed(clientIp)) {
        return json({ status: 429, body: 'too many requests' }, 429);
      }

      const keyFromPath = pathname.startsWith('/api/setting/')
        ? decodeURIComponent(pathname.slice('/api/setting/'.length))
        : null;
      const rawKey = keyFromPath || url.searchParams.get('key');

      const password =
        req.headers.get('x-storage-key') ||
        req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
        url.searchParams.get('p');

      // GET /api/storage
      if (method === 'GET') {
        if (!rawKey || !password) {
          return json({ status: 400, body: 'missing key or encryption password' }, 400);
        }

        const safeKey = sanitizeStorageKey(rawKey);
        if (!safeKey) {
          return json({ status: 400, body: 'invalid key format' }, 400);
        }

        try {
          const encrypted = storage.getSetting(safeKey);
          if (!encrypted) {
            return json({ status: 404, body: 'not found' }, 404);
          }

          const decrypted = Crypto.decrypt(encrypted, password);
          if (decrypted === null) {
            return json({ status: 401, body: 'invalid decryption key' }, 401);
          }

          try {
            JSON.parse(decrypted);
          } catch {
            return json({ status: 401, body: 'invalid decryption key' }, 401);
          }

          return rawJson(decrypted, 200);
        } catch {
          return json({ status: 500, body: 'could not get storage entry' }, 500);
        }
      }

      // POST /api/storage
      if (method === 'POST') {
        const body = await req.text();
        if (!rawKey || !password || !body) {
          return json({ status: 400, body: 'missing key, encryption password, or body' }, 400);
        }

        const safeKey = sanitizeStorageKey(rawKey);
        if (!safeKey) {
          return json({ status: 400, body: 'invalid key format' }, 400);
        }

        try {
          const encrypted = Crypto.encrypt(body, password);
          const { created } = storage.saveSetting(safeKey, encrypted);
          const status = created ? 201 : 200;
          return json({ status, body: created ? 'created' : 'patched' }, status);
        } catch {
          return json({ status: 500, body: 'could not create setting entry' }, 500);
        }
      }
    }

    // 404 Not Found
    return json(
      {
        statusCode: 404,
        name: 'not found',
        message: `${pathname} not found`,
        statusMessage: 'Route not Found',
      },
      404,
    );
  };

  return {
    fetch: fetchHandler,
    storage,
    rateLimiter,
  };
}
