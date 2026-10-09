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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Storage-Key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
    status,
  });
}

function rawJson(rawPayload: string, status = 200): Response {
  return new Response(rawPayload, {
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
    status,
  });
}

export function createApp(db: Database): AppInstance {
  const storage = new StorageService(db),
    rateLimiter = new RateLimiter(120, 60_000),
    fetchHandler = async (req: Request): Promise<Response> => {
      const url = new URL(req.url),
        { pathname } = url,
        method = req.method.toUpperCase();

      // CORS preflight
      if (method === 'OPTIONS') {
        return new Response(null, {
          headers: CORS_HEADERS,
          status: 204,
        });
      }

      // Healthcheck
      if (pathname === '/health' || pathname === '/') {
        return json({
          db: 'connected',
          status: 'ok',
          uptime: process.uptime(),
          version: pkg.version,
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
          return json({ body: 'could not get statistic entries', status: 400 }, 400);
        }
      }

      // Route: GET /api/install
      if (method === 'GET' && pathname === '/api/install') {
        const id = url.searchParams.get('id'),
          browser = url.searchParams.get('browser');
        if (!id || !browser) {
          return json({ body: 'could not create statistic entry', status: 400 }, 400);
        }

        const success = storage.recordInstall(id, browser);
        if (!success) {
          return json({ body: 'could not create statistic entry', status: 400 }, 400);
        }

        return json({ body: 'created', status: 201 }, 201);
      }

      // Route: GET /api/deinstall
      if (method === 'GET' && pathname === '/api/deinstall') {
        const id = url.searchParams.get('id'),
          browser = url.searchParams.get('browser');
        if (!id || !browser) {
          return json({ body: 'could not update statistic entry', status: 400 }, 400);
        }

        const success = storage.recordDeinstall(id, browser);
        if (!success) {
          return json({ body: 'could not update statistic entry', status: 400 }, 400);
        }

        return json({ body: 'updated', status: 200 }, 200);
      }

      // Storage Routes: /api/storage or /api/setting/:key
      const isStorageRoute = pathname === '/api/storage' || pathname.startsWith('/api/setting/');

      if (isStorageRoute) {
        if (!rateLimiter.isAllowed(clientIp)) {
          return json({ body: 'too many requests', status: 429 }, 429);
        }

        const keyFromPath = pathname.startsWith('/api/setting/')
            ? decodeURIComponent(pathname.slice('/api/setting/'.length))
            : null,
          rawKey = keyFromPath || url.searchParams.get('key'),
          password =
            req.headers.get('x-storage-key') ||
            req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
            url.searchParams.get('p');

        // GET /api/storage
        if (method === 'GET') {
          if (!rawKey || !password) {
            return json({ body: 'missing key or encryption password', status: 400 }, 400);
          }

          const safeKey = sanitizeStorageKey(rawKey);
          if (!safeKey) {
            return json({ body: 'invalid key format', status: 400 }, 400);
          }

          try {
            const encrypted = storage.getSetting(safeKey);
            if (!encrypted) {
              return json({ body: 'not found', status: 404 }, 404);
            }

            const decrypted = Crypto.decrypt(encrypted, password);
            if (decrypted === null) {
              return json({ body: 'invalid decryption key', status: 401 }, 401);
            }

            try {
              JSON.parse(decrypted);
            } catch {
              return json({ body: 'invalid decryption key', status: 401 }, 401);
            }

            return rawJson(decrypted, 200);
          } catch {
            return json({ body: 'could not get storage entry', status: 500 }, 500);
          }
        }

        // POST /api/storage
        if (method === 'POST') {
          const body = await req.text();
          if (!rawKey || !password || !body) {
            return json({ body: 'missing key, encryption password, or body', status: 400 }, 400);
          }

          const safeKey = sanitizeStorageKey(rawKey);
          if (!safeKey) {
            return json({ body: 'invalid key format', status: 400 }, 400);
          }

          try {
            const encrypted = Crypto.encrypt(body, password),
              { created } = storage.saveSetting(safeKey, encrypted),
              status = created ? 201 : 200;
            return json({ body: created ? 'created' : 'patched', status }, status);
          } catch {
            return json({ body: 'could not create setting entry', status: 500 }, 500);
          }
        }
      }

      // 404 Not Found
      return json(
        {
          message: `${pathname} not found`,
          name: 'not found',
          statusCode: 404,
          statusMessage: 'Route not Found',
        },
        404,
      );
    };

  return {
    fetch: fetchHandler,
    rateLimiter,
    storage,
  };
}
